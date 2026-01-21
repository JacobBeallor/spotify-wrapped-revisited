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
      )
      SELECT 
        year_month,
        artist_name,
        ROUND(cumulative_hours, 2) AS hours,
        cumulative_plays AS plays
      FROM cumulative_totals
      WHERE cumulative_hours > 0 OR cumulative_plays > 0
      ORDER BY year_month, 
        CASE WHEN ? = 'hours' THEN cumulative_hours ELSE cumulative_plays END DESC
    `

    const results = await executeQuery(sql, [metric])

    return NextResponse.json({ data: results })
  } catch (error: any) {
    console.error('Artist Evolution API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch artist evolution data', details: error.message },
      { status: 500 }
    )
  }
}

