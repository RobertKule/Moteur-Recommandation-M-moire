// src/hooks/useApi.ts
import { useState, useCallback } from 'react'

type ApiFunction<T> = (...args: any[]) => Promise<T>

export function useApi<T>(apiFunction: ApiFunction<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(
    async (...args: any[]) => {
      setLoading(true)
      setError(null)
      try {
        const result = await apiFunction(...args)
        setData(result)
        return result
      } catch (err: any) {
        setError(err.message || 'Une erreur est survenue')
        throw err
      } finally {
        setLoading(false)
      }
    },
    [apiFunction]
  )

  return {
    data,
    loading,
    error,
    execute,
    setData,
  }
}