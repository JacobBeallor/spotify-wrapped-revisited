import { NextResponse } from 'next/server'
import { executeQuery } from '../db'

export async function GET() {
  try {
    const result = await executeQuery(`
      SELECT 
        ROUND(SUM(ms_played) / 1000.0 / 60.0 / 60.0, 2) AS total_hours,
        COUNT(*) AS total_plays,
        COUNT(DISTINCT track_name) AS unique_tracks,
        COUNT(DISTINCT artist_name) AS unique_artists,
        MIN(played_at) AS first_played_at,
        MAX(played_at) AS last_played_at
      FROM plays
    `)
    
    return NextResponse.json(result[0])
  } catch (error: any) {
    console.error('Summary API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch summary', details: error.message },
      { status: 500 }
    )
  }
}

