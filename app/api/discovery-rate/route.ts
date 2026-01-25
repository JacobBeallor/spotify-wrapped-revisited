import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '../db'

export async function GET(request: NextRequest) {
  try {
    const sql = `
      WITH first_listens AS (
        SELECT 
          track_name,
          artist_name,
          MIN(played_at) AS first_played_at,
          TO_CHAR(MIN(played_at), 'YYYY-MM') AS first_year_month
        FROM plays
        GROUP BY track_name, artist_name
      ),
      monthly_stats AS (
        SELECT 
          p.year_month,
          SUM(p.ms_played) / 1000.0 / 60.0 / 60.0 AS total_hours,
          COUNT(*) AS total_plays,
          -- Count only plays where track was discovered in this month
          SUM(CASE WHEN p.year_month = fl.first_year_month 
            THEN p.ms_played ELSE 0 END) / 1000.0 / 60.0 / 60.0 AS discovery_hours,
          COUNT(CASE WHEN p.year_month = fl.first_year_month 
            THEN 1 END) AS discovery_plays
        FROM plays p
        JOIN first_listens fl 
          ON p.track_name = fl.track_name 
          AND p.artist_name = fl.artist_name
        GROUP BY p.year_month
      )
      SELECT 
        year_month,
        ROUND(discovery_hours * 100.0 / NULLIF(total_hours, 0), 2) AS discovery_rate_hours,
        ROUND(discovery_plays * 100.0 / NULLIF(total_plays, 0), 2) AS discovery_rate_plays
      FROM monthly_stats
      ORDER BY year_month
    `

    const results = await executeQuery(sql)

    console.log(`📊 Discovery Rate API: results=${results.length}`)

    return NextResponse.json({
      data: results,
      count: results.length
    })

  } catch (error: any) {
    console.error('Discovery Rate API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch discovery rate', details: error.message },
      { status: 500 }
    )
  }
}

