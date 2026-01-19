import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '../db'

export async function GET(request: NextRequest) {
  try {
    const sql = `
      SELECT 
        dow,
        dow_name,
        ROUND(SUM(ms_played) / 1000.0 / 60.0 / 60.0, 2) AS hours,
        COUNT(*) AS plays
      FROM plays
      GROUP BY dow, dow_name
      ORDER BY dow
    `
    
    const results = await executeQuery(sql)
    
    return NextResponse.json({ data: results })
  } catch (error: any) {
    console.error('Day of Week API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch day of week data', details: error.message },
      { status: 500 }
    )
  }
}

