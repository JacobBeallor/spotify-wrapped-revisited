import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '../db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const start = searchParams.get('start')
    const end = searchParams.get('end')
    const groupBy = searchParams.get('groupBy') || 'decade'  // 'year' or 'decade'
    
    const groupByField = groupBy === 'year' ? 't.release_year' : 't.release_decade'
    
    const sql = `
      SELECT 
        ${groupByField} AS period,
        ROUND(SUM(p.ms_played) / 1000.0 / 60.0 / 60.0, 2) AS hours,
        COUNT(*) AS plays,
        COUNT(DISTINCT p.track_name) AS unique_tracks
      FROM plays p
      JOIN tracks t ON p.spotify_track_uri = t.spotify_track_uri
      WHERE t.release_year IS NOT NULL
        ${start ? `AND p.year_month >= ?` : ''}
        ${end ? `AND p.year_month <= ?` : ''}
      GROUP BY period
      ORDER BY period
    `
    
    const paramValues = [start, end].filter(Boolean)
    const results = await executeQuery(sql, paramValues)
    
    return NextResponse.json({ data: results, groupBy })
  } catch (error: any) {
    console.error('Release Years API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch release year data', details: error.message },
      { status: 500 }
    )
  }
}

