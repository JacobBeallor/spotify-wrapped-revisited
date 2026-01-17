import { useState, useEffect } from 'react'

export function useApiData<T>(
  endpoint: string,
  params?: Record<string, string | number | undefined>
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const queryParams = new URLSearchParams(
          Object.entries(params || {})
            .filter(([_, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
        )
        
        const url = `/api/${endpoint}${queryParams.toString() ? '?' + queryParams : ''}`
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const result = await response.json()
        setData(result)
      } catch (err: any) {
        console.error(`Failed to fetch ${endpoint}:`, err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [endpoint, JSON.stringify(params)])
  
  return { data, loading, error }
}

