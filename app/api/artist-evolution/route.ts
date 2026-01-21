import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '../db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const metric = searchParams.get('metric') || 'hours'

    // Calculate all-time cumulative totals including all historical data
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
      ranked_artists AS (
        SELECT 
          year_month,
          artist_name,
          cumulative_hours,
          cumulative_plays,
          ROW_NUMBER() OVER (
            PARTITION BY year_month 
            ORDER BY CASE WHEN ? = 'hours' THEN cumulative_hours ELSE cumulative_plays END DESC
          ) AS rank
        FROM cumulative_totals
        WHERE cumulative_hours > 0 OR cumulative_plays > 0
      ),
      relevant_artists AS (
        -- Only include artists that appear in top 15 at least once
        SELECT DISTINCT artist_name
        FROM ranked_artists
        WHERE rank <= 15
      )
      SELECT 
        ra.year_month,
        ra.artist_name,
        ROUND(ra.cumulative_hours, 2) AS hours,
        ra.cumulative_plays AS plays
      FROM ranked_artists ra
      JOIN relevant_artists rel ON ra.artist_name = rel.artist_name
      ORDER BY ra.year_month, 
        CASE WHEN ? = 'hours' THEN ra.cumulative_hours ELSE ra.cumulative_plays END DESC
    `

    const results = await executeQuery(sql, [metric, metric])

    return NextResponse.json({ data: results })
  } catch (error: any) {
    console.error('Artist Evolution API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch artist evolution data', details: error.message },
      { status: 500 }
    )
  }
}

