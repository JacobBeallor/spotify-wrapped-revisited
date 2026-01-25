import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '../db'

export async function GET(request: NextRequest) {
  try {
    // Calculate all-time cumulative totals for broad genres
    // Returns genres in top 15 by EITHER hours OR plays (union) to support client-side metric switching
    // IMPORTANT: Deduplicate at play level to avoid double-counting when multiple
    // subgenres map to same broad genre (e.g., "soft rock" + "folk rock" = "Rock")
    const sql = `
      WITH play_genres_expanded AS (
        -- Expand each play to all its genres
        SELECT 
          p.played_at,
          p.year_month,
          p.ms_played,
          COALESCE(gm.broad_genre, artist_subgenre) AS genre
        FROM plays p
        JOIN artists a ON p.artist_name = a.artist_name
        CROSS JOIN unnest(string_to_array(a.genres, ',')) AS artist_subgenre
        LEFT JOIN genre_mappings gm ON TRIM(artist_subgenre) = gm.subgenre
        WHERE a.genres IS NOT NULL
      ),
      play_genre_counts AS (
        -- Count distinct genres per play (Redshift doesn't support COUNT(DISTINCT) in window functions)
        SELECT 
          played_at,
          COUNT(DISTINCT genre) AS unique_genre_count
        FROM play_genres_expanded
        GROUP BY played_at
      ),
      play_genre_mapping AS (
        -- Deduplicate broad genres and distribute time
        SELECT DISTINCT
          pge.played_at,
          pge.year_month,
          pge.ms_played / pgc.unique_genre_count AS ms_played_distributed,
          pge.genre
        FROM play_genres_expanded pge
        JOIN play_genre_counts pgc ON pge.played_at = pgc.played_at
      ),
      monthly_genre_data AS (
        -- Aggregate by month and genre
        SELECT 
          year_month,
          genre,
          SUM(ms_played_distributed) / 1000.0 / 60.0 / 60.0 AS hours,
          COUNT(DISTINCT played_at) AS plays
        FROM play_genre_mapping
        GROUP BY year_month, genre
      ),
      all_months AS (
        SELECT DISTINCT year_month
        FROM plays
        WHERE year_month >= '2018-01'
        ORDER BY year_month
      ),
      all_genres AS (
        SELECT DISTINCT genre
        FROM monthly_genre_data
        -- Exclude Holiday genre - upon inspection, artists tagged as "christmas" 
        -- (e.g., Lawrence) weren't actually holiday music, just miscategorized in Spotify's metadata
        WHERE genre != 'Holiday'
      ),
      genre_month_spine AS (
        SELECT 
          m.year_month,
          g.genre
        FROM all_months m
        CROSS JOIN all_genres g
      ),
      cumulative_totals AS (
        SELECT 
          spine.year_month,
          spine.genre,
          COALESCE(SUM(mgd.hours), 0) as cumulative_hours,
          COALESCE(SUM(mgd.plays), 0) as cumulative_plays
        FROM genre_month_spine spine
        LEFT JOIN monthly_genre_data mgd
          ON mgd.genre = spine.genre
          AND mgd.year_month <= spine.year_month
        GROUP BY spine.year_month, spine.genre
      ),
      ranked_by_hours AS (
        SELECT 
          genre,
          ROW_NUMBER() OVER (PARTITION BY year_month ORDER BY cumulative_hours DESC) AS rank
        FROM cumulative_totals
        WHERE cumulative_hours > 0
      ),
      ranked_by_plays AS (
        SELECT 
          genre,
          ROW_NUMBER() OVER (PARTITION BY year_month ORDER BY cumulative_plays DESC) AS rank
        FROM cumulative_totals
        WHERE cumulative_plays > 0
      ),
      relevant_genres AS (
        -- Union of genres in top 15 by hours OR plays
        SELECT DISTINCT genre FROM ranked_by_hours WHERE rank <= 15
        UNION
        SELECT DISTINCT genre FROM ranked_by_plays WHERE rank <= 15
      )
      SELECT 
        ct.year_month,
        ct.genre,
        ROUND(ct.cumulative_hours, 2) AS hours,
        ct.cumulative_plays AS plays
      FROM cumulative_totals ct
      JOIN relevant_genres rel ON ct.genre = rel.genre
      WHERE ct.cumulative_hours > 0 OR ct.cumulative_plays > 0
      ORDER BY ct.year_month, ct.cumulative_hours DESC
    `

    const results = await executeQuery(sql, [])

    return NextResponse.json({ data: results })
  } catch (error: any) {
    console.error('Genre Evolution API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch genre evolution data', details: error.message },
      { status: 500 }
    )
  }
}

