import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '../db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '50')
    
    const sql = `
      WITH artist_stats AS (
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
      ),
      artist_top_tracks AS (
        SELECT 
          p.artist_name,
          p.track_name,
          p.spotify_track_uri,
          SUM(p.ms_played) AS total_ms,
          ROW_NUMBER() OVER (PARTITION BY p.artist_name ORDER BY SUM(p.ms_played) DESC) AS rn
        FROM plays p
        WHERE p.artist_name IN (SELECT artist_name FROM artist_stats)
          ${startDate ? `AND p.date >= ?` : ''}
          ${endDate ? `AND p.date <= ?` : ''}
        GROUP BY p.artist_name, p.track_name, p.spotify_track_uri
      )
      SELECT 
        s.artist_name,
        s.hours,
        s.plays,
        s.spotify_artist_id,
        s.image_url,
        t.track_name AS top_track_name,
        t.spotify_track_uri AS top_track_uri
      FROM artist_stats s
      LEFT JOIN artist_top_tracks t ON s.artist_name = t.artist_name AND t.rn = 1
      ORDER BY s.hours DESC
    `
    
    // Build params array - need to include date filters twice (once for artist_stats, once for artist_top_tracks)
    const paramValues = []
    if (startDate) paramValues.push(startDate)
    if (endDate) paramValues.push(endDate)
    paramValues.push(limit)
    if (startDate) paramValues.push(startDate)
    if (endDate) paramValues.push(endDate)
    
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

