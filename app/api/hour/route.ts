import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '../db'

export async function GET(request: NextRequest) {
  try {
    const sql = `
      SELECT 
        hour,
        ROUND(SUM(ms_played) / 1000.0 / 60.0 / 60.0, 2) AS hours,
        COUNT(*) AS plays
      FROM plays
      GROUP BY hour
      ORDER BY hour
    `
    
    const results = await executeQuery(sql)
    
    return NextResponse.json({ data: results })
  } catch (error: any) {
    console.error('Hour API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hour data', details: error.message },
      { status: 500 }
    )
  }
}

