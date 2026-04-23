import type { Dossier } from '@confluent/shared'
import { apiRequest } from '@/lib/api-client'

export function listDossiers(): Promise<Dossier[]> {
  return apiRequest<Dossier[]>('/v1/dossiers')
}

export function getDossier(id: string): Promise<Dossier> {
  return apiRequest<Dossier>(`/v1/dossiers/${encodeURIComponent(id)}`)
}

export function createDossier(input: { name: string }): Promise<Dossier> {
  return apiRequest<Dossier>('/v1/dossiers', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateDossier(id: string, input: { name: string }): Promise<Dossier> {
  return apiRequest<Dossier>(`/v1/dossiers/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export function deleteDossier(id: string): Promise<void> {
  return apiRequest<void>(`/v1/dossiers/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export function submitDossier(id: string): Promise<Dossier> {
  return apiRequest<Dossier>(`/v1/dossiers/${encodeURIComponent(id)}/submit`, {
    method: 'POST',
  })
}
