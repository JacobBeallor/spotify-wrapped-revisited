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

export async function executeQuery<T = any>(
  query: string,
  params?: any[]
): Promise<T[]> {
  try {
    // Use Vercel Postgres (works in serverless)
    const { rows } = await sql.query(query, params || [])
    // Convert BigInt values to Numbers for JSON serialization
    return convertBigIntsToNumbers(rows) as T[]
  } catch (error: any) {
    console.error('Database query error:', error)
    throw error
  }
}

