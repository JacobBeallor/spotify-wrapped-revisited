import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '../db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '50')
    
    const sql = `
      SELECT 
        p.artist_name,
        ROUND(SUM(p.ms_played) / 1000.0 / 60.0 / 60.0, 2) AS hours,
        COUNT(*) AS plays,
        a.spotify_artist_id,
        a.image_url
      FROM plays p
      LEFT JOIN artists a ON p.artist_name = a.artist_name
      WHERE 1=1
        ${startDate ? `AND p.date >= ?` : ''}
        ${endDate ? `AND p.date <= ?` : ''}
      GROUP BY p.artist_name, a.spotify_artist_id, a.image_url
      ORDER BY hours DESC
      LIMIT ?
    `
    
    const paramValues = [startDate, endDate, limit].filter(v => v !== null)
    const results = await executeQuery(sql, paramValues)
    
    return NextResponse.json({ data: results })
  } catch (error: any) {
    console.error('Top Artists API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch top artists', details: error.message },
      { status: 500 }
    )
  }
}

