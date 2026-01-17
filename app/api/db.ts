import { Database } from 'duckdb-async'
import path from 'path'

let dbInstance: Database | null = null

export async function getDb(): Promise<Database> {
  if (!dbInstance) {
    const dbPath = path.join(process.cwd(), 'data', 'spotify.duckdb')
    dbInstance = await Database.create(dbPath)
  }
  return dbInstance
}

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
  sql: string,
  params?: any[]
): Promise<T[]> {
  const db = await getDb()
  const conn = await db.connect()
  
  try {
    const result = await conn.all(sql, ...(params || []))
    // Convert BigInt values to Numbers for JSON serialization
    return convertBigIntsToNumbers(result) as T[]
  } finally {
    await conn.close()
  }
}

