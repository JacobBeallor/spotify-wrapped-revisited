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
        MAX(played_at) AS last_played_at,
        CAST(MAX(played_at) AS VARCHAR) AS last_played_at_str
      FROM plays
    `)
    
    const data = result[0]
    
    // Use the string version if available
    if (data.last_played_at_str) {
      data.last_played_at = data.last_played_at_str
      delete data.last_played_at_str
    } else if (data.last_played_at) {
      // Try to convert if it's not a string
      const lastDate = new Date(data.last_played_at)
      if (!isNaN(lastDate.getTime())) {
        data.last_played_at = lastDate.toISOString()
      }
    }
    
    if (data.first_played_at) {
      const firstDate = new Date(data.first_played_at)
      if (!isNaN(firstDate.getTime())) {
        data.first_played_at = firstDate.toISOString()
      }
    }
    
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Summary API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch summary', details: error.message },
      { status: 500 }
    )
  }
}

