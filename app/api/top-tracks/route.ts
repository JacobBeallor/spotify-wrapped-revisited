import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '../db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const start = searchParams.get('start')
    const end = searchParams.get('end')
    const limit = parseInt(searchParams.get('limit') || '50')
    
    const sql = `
      SELECT 
        p.track_name,
        p.artist_name,
        ROUND(SUM(p.ms_played) / 1000.0 / 60.0 / 60.0, 2) AS hours,
        COUNT(*) AS plays,
        t.spotify_track_uri
      FROM plays p
      LEFT JOIN tracks t ON p.spotify_track_uri = t.spotify_track_uri
      WHERE 1=1
        ${start ? `AND p.year_month >= ?` : ''}
        ${end ? `AND p.year_month <= ?` : ''}
      GROUP BY p.track_name, p.artist_name, t.spotify_track_uri
      ORDER BY hours DESC
      LIMIT ?
    `
    
    const paramValues = [start, end, limit].filter(v => v !== null)
    const results = await executeQuery(sql, paramValues)
    
    return NextResponse.json({ data: results })
  } catch (error: any) {
    console.error('Top Tracks API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch top tracks', details: error.message },
      { status: 500 }
    )
  }
}

