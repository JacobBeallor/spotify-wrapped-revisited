import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '../db'

export async function GET(request: NextRequest) {
  try {
    // Query monthly listening trends by release decade
    // Returns monthly values (not cumulative) for streamgraph visualization
    // Filters out pre-1950s music
    const sql = `
      SELECT 
        p.year_month,
        t.release_decade AS decade,
        ROUND(SUM(p.ms_played) / 1000.0 / 60.0 / 60.0, 2) AS hours,
        COUNT(*) AS plays
      FROM plays p
      JOIN tracks t ON p.spotify_track_uri = t.spotify_track_uri
      WHERE t.release_decade IS NOT NULL
        AND t.release_year >= 1950
      GROUP BY p.year_month, t.release_decade
      ORDER BY p.year_month, t.release_decade
    `

    const results = await executeQuery(sql, [])

    return NextResponse.json({ data: results })
  } catch (error: any) {
    console.error('Decade Evolution API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch decade evolution data', details: error.message },
      { status: 500 }
    )
  }
}
