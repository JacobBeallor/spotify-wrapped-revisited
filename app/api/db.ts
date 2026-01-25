import { prisma } from '@/lib/db'

// Helper function to convert BigInt, Decimal, and numeric strings to Number for JSON serialization
function convertBigIntsToNumbers(obj: any): any {
  if (obj === null || obj === undefined) return obj
  
  if (typeof obj === 'bigint') {
    return Number(obj)
  }
  
  // Handle Prisma Decimal objects
  if (obj && typeof obj === 'object' && 'toNumber' in obj && typeof obj.toNumber === 'function') {
    return obj.toNumber()
  }
  
  // Handle numeric strings from PostgreSQL (but preserve non-numeric strings)
  if (typeof obj === 'string' && /^-?\d+(\.\d+)?$/.test(obj)) {
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
      // Production: Use Prisma Client with raw SQL
      // Prisma uses $1, $2, $3 for parameters, so we need to convert ? to $N
      let pgQuery = query
      let pgParams = params || []
      
      // Convert ? placeholders to $1, $2, $3 for PostgreSQL
      let paramIndex = 1
      pgQuery = pgQuery.replace(/\?/g, () => `$${paramIndex++}`)
      
      // Execute raw SQL query with Prisma
      const result = await prisma.$queryRawUnsafe(pgQuery, ...pgParams)
      return convertBigIntsToNumbers(result) as T[]
    }
  } catch (error: any) {
    console.error('Database query error:', error)
    console.error('Query:', query.substring(0, 500))
    console.error('Environment:', { isProduction, useLocalDuckDB })
    throw error
  }
}

