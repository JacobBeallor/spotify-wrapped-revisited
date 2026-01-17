import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '../db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const start = searchParams.get('start')
    const end = searchParams.get('end')
    
    const sql = `
      SELECT 
        year_month,
        dow,
        dow_name,
        ROUND(SUM(ms_played) / 1000.0 / 60.0 / 60.0, 2) AS hours,
        COUNT(*) AS plays
      FROM plays
      WHERE 1=1
        ${start ? `AND year_month >= ?` : ''}
        ${end ? `AND year_month <= ?` : ''}
      GROUP BY year_month, dow, dow_name
      ORDER BY year_month, dow
    `
    
    const paramValues = [start, end].filter(Boolean)
    const results = await executeQuery(sql, paramValues)
    
    return NextResponse.json({ data: results })
  } catch (error: any) {
    console.error('Day of Week API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch day of week data', details: error.message },
      { status: 500 }
    )
  }
}

