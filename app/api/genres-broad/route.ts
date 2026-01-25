import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '../db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const start = searchParams.get('start')
    const end = searchParams.get('end')
    
    // Query plays joined with artists and genre_mappings to get broad genres
    const sql = `
      WITH unnested_genres AS (
        SELECT 
          unnest(string_to_array(a.genres, ',')) AS subgenre,
          p.ms_played
        FROM plays p
        JOIN artists a ON p.artist_name = a.artist_name
        WHERE a.genres IS NOT NULL
          ${start ? `AND p.year_month >= ?` : ''}
          ${end ? `AND p.year_month <= ?` : ''}
      )
      SELECT 
        COALESCE(gm.broad_genre, ug.subgenre) AS genre,
        ROUND(SUM(ug.ms_played) / 1000.0 / 60.0 / 60.0, 2) AS hours,
        COUNT(*) AS plays
      FROM unnested_genres ug
      LEFT JOIN genre_mappings gm ON ug.subgenre = gm.subgenre
      GROUP BY genre
      ORDER BY hours DESC
    `
    
    const paramValues = [start, end].filter(Boolean)
    const results = await executeQuery(sql, paramValues)
    
    return NextResponse.json({ data: results })
  } catch (error: any) {
    console.error('Broad genres API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch broad genres', details: error.message },
      { status: 500 }
    )
  }
}

