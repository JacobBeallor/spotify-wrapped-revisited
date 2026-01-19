import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '../db'

export async function GET(request: NextRequest) {
  try {
    const sql = `
      SELECT 
        year_month,
        year,
        month,
        ROUND(SUM(ms_played) / 1000.0 / 60.0 / 60.0, 2) AS hours,
        COUNT(*) AS plays,
        COUNT(DISTINCT track_name) AS unique_tracks,
        COUNT(DISTINCT artist_name) AS unique_artists
      FROM plays
      GROUP BY year_month, year, month
      ORDER BY year_month
    `

    const results = await executeQuery(sql)

    console.log(`📈 Trends API: results=${results.length}`)

    return NextResponse.json({
      data: results,
      granularity: 'monthly',
      count: results.length
    })

  } catch (error: any) {
    console.error('Trends API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trends', details: error.message },
      { status: 500 }
    )
  }
}

