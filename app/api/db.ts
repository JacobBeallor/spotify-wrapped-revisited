import { sql } from '@vercel/postgres'

// Helper function to convert BigInt to Number for JSON serialization
function convertBigIntsToNumbers(obj: any): any {
  if (obj === null || obj === undefined) return obj
  
  if (typeof obj === 'bigint') {
    return Number(obj)
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => convertBigIntsToNumbers(item))
  }
  
  if (typeof obj === 'object') {
    const converted: any = {}
    for (const key in obj) {
      converted[key] = convertBigIntsToNumbers(obj[key])
    }
    return converted
  }
  
  return obj
}

// Determine environment
const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production'
const useLocalDuckDB = !isProduction && !process.env.POSTGRES_URL

export async function executeQuery<T = any>(
  query: string,
  params?: any[]
): Promise<T[]> {
  try {
    if (useLocalDuckDB) {
      // Local development: Use DuckDB
      const { Database } = await import('duckdb-async')
      const path = await import('path')
      
      const dbPath = path.join(process.cwd(), 'data', 'spotify.duckdb')
      const db = await Database.create(dbPath)
      const conn = await db.connect()
      
      try {
        const result = await conn.all(query, ...(params || []))
        return convertBigIntsToNumbers(result) as T[]
      } finally {
        await conn.close()
      }
    } else {
      // Production or explicit Postgres: Use Vercel Postgres
      const { rows } = await sql.query(query, params || [])
      return convertBigIntsToNumbers(rows) as T[]
    }
  } catch (error: any) {
    console.error('Database query error:', error)
    console.error('Environment:', { isProduction, useLocalDuckDB })
    throw error
  }
}

