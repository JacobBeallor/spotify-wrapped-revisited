import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '../db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const metric = searchParams.get('metric') || 'hours'

    // Calculate all-time cumulative totals for broad genres
    // IMPORTANT: Deduplicate at play level to avoid double-counting when multiple
    // subgenres map to same broad genre (e.g., "soft rock" + "folk rock" = "Rock")
    const sql = `
      WITH play_genres_expanded AS (
        -- Expand each play to all its genres with count per play
        SELECT 
          p.played_at,
          p.year_month,
          p.ms_played,
          COALESCE(gm.broad_genre, artist_subgenre) AS genre,
          COUNT(DISTINCT COALESCE(gm.broad_genre, artist_subgenre)) OVER (PARTITION BY p.played_at) AS unique_genre_count
        FROM plays p
        JOIN artists a ON p.artist_name = a.artist_name
        CROSS JOIN UNNEST(STRING_SPLIT(a.genres, ',')) AS t(artist_subgenre)
        LEFT JOIN genre_mappings gm ON TRIM(artist_subgenre) = gm.subgenre
        WHERE a.genres IS NOT NULL
      ),
      play_genre_mapping AS (
        -- Deduplicate broad genres and distribute time
        SELECT DISTINCT
          played_at,
          year_month,
          ms_played / unique_genre_count AS ms_played_distributed,
          genre
        FROM play_genres_expanded
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
      ranked_genres AS (
        SELECT 
          year_month,
          genre,
          cumulative_hours,
          cumulative_plays,
          ROW_NUMBER() OVER (
            PARTITION BY year_month 
            ORDER BY CASE WHEN ? = 'hours' THEN cumulative_hours ELSE cumulative_plays END DESC
          ) AS rank
        FROM cumulative_totals
        WHERE cumulative_hours > 0 OR cumulative_plays > 0
      ),
      relevant_genres AS (
        -- Only include genres that appear in top 15 at least once
        SELECT DISTINCT genre
        FROM ranked_genres
        WHERE rank <= 15
      )
      SELECT 
        rg.year_month,
        rg.genre,
        ROUND(rg.cumulative_hours, 2) AS hours,
        rg.cumulative_plays AS plays
      FROM ranked_genres rg
      JOIN relevant_genres rel ON rg.genre = rel.genre
      ORDER BY rg.year_month, 
        CASE WHEN ? = 'hours' THEN rg.cumulative_hours ELSE rg.cumulative_plays END DESC
    `

    const results = await executeQuery(sql, [metric, metric])

    return NextResponse.json({ data: results })
  } catch (error: any) {
    console.error('Genre Evolution API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch genre evolution data', details: error.message },
      { status: 500 }
    )
  }
}

