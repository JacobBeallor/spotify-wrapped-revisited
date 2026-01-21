import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '../db'

export async function GET(request: NextRequest) {
  try {
    // Calculate all-time cumulative totals including all historical data
    // Returns artists in top 15 by EITHER hours OR plays (union) to support client-side metric switching
    const sql = `
      WITH monthly_artist_data AS (
        SELECT 
          year_month,
          artist_name,
          SUM(ms_played) / 1000.0 / 60.0 / 60.0 AS hours,
          COUNT(*) AS plays
        FROM plays
        GROUP BY year_month, artist_name
      ),
      all_months AS (
        SELECT DISTINCT year_month
        FROM plays
        WHERE year_month >= '2018-01'
        ORDER BY year_month
      ),
      all_artists AS (
        SELECT DISTINCT artist_name
        FROM plays
      ),
      artist_month_spine AS (
        SELECT 
          m.year_month,
          a.artist_name
        FROM all_months m
        CROSS JOIN all_artists a
      ),
      cumulative_totals AS (
        SELECT 
          spine.year_month,
          spine.artist_name,
          COALESCE(SUM(mad.hours), 0) as cumulative_hours,
          COALESCE(SUM(mad.plays), 0) as cumulative_plays
        FROM artist_month_spine spine
        LEFT JOIN monthly_artist_data mad
          ON mad.artist_name = spine.artist_name
          AND mad.year_month <= spine.year_month
        GROUP BY spine.year_month, spine.artist_name
      ),
      ranked_by_hours AS (
        SELECT 
          artist_name,
          ROW_NUMBER() OVER (PARTITION BY year_month ORDER BY cumulative_hours DESC) AS rank
        FROM cumulative_totals
        WHERE cumulative_hours > 0
      ),
      ranked_by_plays AS (
        SELECT 
          artist_name,
          ROW_NUMBER() OVER (PARTITION BY year_month ORDER BY cumulative_plays DESC) AS rank
        FROM cumulative_totals
        WHERE cumulative_plays > 0
      ),
      relevant_artists AS (
        -- Union of artists in top 15 by hours OR plays
        SELECT DISTINCT artist_name FROM ranked_by_hours WHERE rank <= 15
        UNION
        SELECT DISTINCT artist_name FROM ranked_by_plays WHERE rank <= 15
      )
      SELECT 
        ct.year_month,
        ct.artist_name,
        ROUND(ct.cumulative_hours, 2) AS hours,
        ct.cumulative_plays AS plays
      FROM cumulative_totals ct
      JOIN relevant_artists rel ON ct.artist_name = rel.artist_name
      WHERE ct.cumulative_hours > 0 OR ct.cumulative_plays > 0
      ORDER BY ct.year_month, ct.cumulative_hours DESC
    `

    const results = await executeQuery(sql, [])

    return NextResponse.json({ data: results })
  } catch (error: any) {
    console.error('Artist Evolution API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch artist evolution data', details: error.message },
      { status: 500 }
    )
  }
}

