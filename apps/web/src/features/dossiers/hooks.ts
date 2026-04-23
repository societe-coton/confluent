import { useCallback, useEffect, useState } from 'react'
import type { Dossier } from '@confluent/shared'
import { getDossier, listDossiers } from './api'

interface QueryState<T> {
  data: T | undefined
  isLoading: boolean
  error: unknown
  refetch: () => void
}

function useAsync<T>(fn: () => Promise<T>, deps: unknown[]): QueryState<T> {
  const [data, setData] = useState<T | undefined>(undefined)
  const [error, setError] = useState<unknown>(null)
  const [isLoading, setLoading] = useState<boolean>(true)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fn()
      .then((res) => {
        if (!cancelled) {
          setData(res)
          setError(null)
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])

  const refetch = useCallback(() => setTick((n) => n + 1), [])
  return { data, isLoading, error, refetch }
}

export function useDossiers(): QueryState<Dossier[]> {
  return useAsync(() => listDossiers(), [])
}

export function useDossier(id: string | undefined): QueryState<Dossier> {
  return useAsync(
    () => (id ? getDossier(id) : Promise.reject(new Error('id required'))),
    [id],
  )
}
