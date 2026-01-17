import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '../db'
import { z } from 'zod'

const querySchema = z.object({
  granularity: z.enum(['daily', 'weekly', 'monthly', 'auto']).default('monthly'),
  start: z.string().optional(),
  end: z.string().optional(),
  metric: z.enum(['hours', 'plays']).default('hours')
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const params = querySchema.parse({
      granularity: searchParams.get('granularity') || 'monthly',
      start: searchParams.get('start') || undefined,
      end: searchParams.get('end') || undefined,
      metric: searchParams.get('metric') || 'hours'
    })
    
    let { granularity, start, end } = params
    
    // Auto-detect granularity based on date range
    if (granularity === 'auto' && start && end) {
      const startDate = new Date(start)
      const endDate = new Date(end)
      const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffDays <= 62) granularity = 'daily'
      else if (diffDays <= 180) granularity = 'weekly'
      else granularity = 'monthly'
    }
    
    let sql = ''
    
    if (granularity === 'daily') {
      sql = `
        SELECT 
          DATE(played_at) AS date,
          ROUND(SUM(ms_played) / 1000.0 / 60.0 / 60.0, 2) AS hours,
          COUNT(*) AS plays,
          COUNT(DISTINCT track_name) AS unique_tracks,
          COUNT(DISTINCT artist_name) AS unique_artists
        FROM plays
        WHERE 1=1
          ${start ? `AND played_at >= ?` : ''}
          ${end ? `AND played_at <= ?` : ''}
        GROUP BY date
        ORDER BY date
      `
    } else if (granularity === 'weekly') {
      sql = `
        SELECT 
          STRFTIME(DATE_TRUNC('week', played_at), '%Y-W%V') AS year_week,
          DATE_TRUNC('week', played_at) AS week_start,
          ROUND(SUM(ms_played) / 1000.0 / 60.0 / 60.0, 2) AS hours,
          COUNT(*) AS plays,
          COUNT(DISTINCT track_name) AS unique_tracks,
          COUNT(DISTINCT artist_name) AS unique_artists
        FROM plays
        WHERE 1=1
          ${start ? `AND played_at >= ?` : ''}
          ${end ? `AND played_at <= ?` : ''}
        GROUP BY year_week, week_start
        ORDER BY week_start
      `
    } else {
      sql = `
        SELECT 
          year_month,
          year,
          month,
          ROUND(SUM(ms_played) / 1000.0 / 60.0 / 60.0, 2) AS hours,
          COUNT(*) AS plays,
          COUNT(DISTINCT track_name) AS unique_tracks,
          COUNT(DISTINCT artist_name) AS unique_artists
        FROM plays
        WHERE 1=1
          ${start ? `AND year_month >= ?` : ''}
          ${end ? `AND year_month <= ?` : ''}
        GROUP BY year_month, year, month
        ORDER BY year_month
      `
    }
    
    const paramValues = [start, end].filter(Boolean)
    const results = await executeQuery(sql, paramValues)
    
    return NextResponse.json({
      data: results,
      granularity,
      count: results.length
    })
    
  } catch (error: any) {
    console.error('Trends API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trends', details: error.message },
      { status: 500 }
    )
  }
}

