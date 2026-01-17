import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '../db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const topN = parseInt(searchParams.get('topN') || '10')
    
    // Calculate rolling 4-quarter (12-month) totals and ranks with date spine
    const sql = `
      WITH plays_with_quarter AS (
        SELECT 
          *,
          year || '-Q' || CAST((month + 2) / 3 AS INTEGER) as year_quarter
        FROM plays
      ),
      all_quarters AS (
        SELECT DISTINCT year_quarter
        FROM plays_with_quarter
      ),
      quarterly_artist_hours AS (
        SELECT 
          year_quarter,
          artist_name,
          SUM(ms_played) / 1000.0 / 60.0 / 60.0 as hours
        FROM plays_with_quarter
        GROUP BY year_quarter, artist_name
      ),
      all_artists AS (
        SELECT DISTINCT artist_name
        FROM plays_with_quarter
      ),
      artist_quarter_spine AS (
        SELECT 
          q.year_quarter,
          a.artist_name
        FROM all_quarters q
        CROSS JOIN all_artists a
      ),
      artist_hours_complete AS (
        SELECT 
          s.year_quarter,
          s.artist_name,
          COALESCE(h.hours, 0) as hours
        FROM artist_quarter_spine s
        LEFT JOIN quarterly_artist_hours h
          ON s.year_quarter = h.year_quarter
          AND s.artist_name = h.artist_name
      ),
      rolling_artists AS (
        SELECT 
          a1.year_quarter,
          a1.artist_name,
          SUM(a2.hours) as rolling_4q_hours
        FROM artist_hours_complete a1
        JOIN artist_hours_complete a2 
          ON a2.artist_name = a1.artist_name
          AND a2.year_quarter <= a1.year_quarter
          AND (
            CAST(SUBSTR(a2.year_quarter, 1, 4) AS INTEGER) * 4 + CAST(SUBSTR(a2.year_quarter, 7, 1) AS INTEGER)
            >= CAST(SUBSTR(a1.year_quarter, 1, 4) AS INTEGER) * 4 + CAST(SUBSTR(a1.year_quarter, 7, 1) AS INTEGER) - 3
          )
        GROUP BY a1.year_quarter, a1.artist_name
      ),
      ranked_artists AS (
        SELECT 
          year_quarter,
          artist_name,
          rolling_4q_hours,
          ROW_NUMBER() OVER (
            PARTITION BY year_quarter 
            ORDER BY rolling_4q_hours DESC
          ) as rank
        FROM rolling_artists
        WHERE rolling_4q_hours > 0
      ),
      top_artists_ever AS (
        SELECT DISTINCT artist_name
        FROM ranked_artists
        WHERE rank <= ?
      )
      SELECT 
        r.year_quarter,
        r.artist_name,
        r.rank,
        ROUND(r.rolling_4q_hours, 2) as hours
      FROM ranked_artists r
      WHERE r.artist_name IN (SELECT artist_name FROM top_artists_ever)
      ORDER BY r.year_quarter, r.rank
    `
    
    const results = await executeQuery(sql, [topN])
    
    return NextResponse.json({ data: results })
  } catch (error: any) {
    console.error('Artist Evolution API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch artist evolution data', details: error.message },
      { status: 500 }
    )
  }
}

