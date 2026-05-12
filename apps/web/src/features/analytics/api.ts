import type { DossierAnalytics, PlatformAnalytics } from '@confluent/shared'
import { apiRequest } from '@/lib/api-client'

export function getAnalytics(dossierId: string): Promise<DossierAnalytics> {
  return apiRequest<DossierAnalytics>(
    `/v1/dossiers/${encodeURIComponent(dossierId)}/analytics`,
  )
}

export function getPlatformAnalytics(): Promise<PlatformAnalytics> {
  return apiRequest<PlatformAnalytics>('/v1/admin/analytics')
}
