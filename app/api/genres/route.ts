import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '../db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const start = searchParams.get('start')
    const end = searchParams.get('end')
    
    // Query plays joined with artists table to get genres
    const sql = `
      SELECT 
        UNNEST(STRING_SPLIT(a.genres, ',')) AS genre,
        ROUND(SUM(p.ms_played) / 1000.0 / 60.0 / 60.0, 2) AS hours,
        COUNT(*) AS plays
      FROM plays p
      JOIN artists a ON p.artist_name = a.artist_name
      WHERE a.genres IS NOT NULL
        ${start ? `AND p.year_month >= ?` : ''}
        ${end ? `AND p.year_month <= ?` : ''}
      GROUP BY genre
      ORDER BY hours DESC
    `
    
    const paramValues = [start, end].filter(Boolean)
    const results = await executeQuery(sql, paramValues)
    
    return NextResponse.json({ data: results })
  } catch (error: any) {
    console.error('Genres API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch genres', details: error.message },
      { status: 500 }
    )
  }
}

