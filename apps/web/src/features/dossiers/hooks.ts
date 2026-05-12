import type { Dossier } from '@confluent/shared'
import { useAsync, type QueryState } from '@/lib/useAsync'
import { getDossier, listDossiers } from './api'

export function useDossiers(): QueryState<Dossier[]> {
  return useAsync(() => listDossiers(), [])
}

export function useDossier(id: string | undefined): QueryState<Dossier> {
  return useAsync(
    () => (id ? getDossier(id) : Promise.reject(new Error('id required'))),
    [id],
  )
}
