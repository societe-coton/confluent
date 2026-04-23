import { apiRequest } from '@/lib/api-client'

export interface PerRecipientAnalytics {
  shareLinkId: string
  recipientEmail: string
  status: string
  viewCount: number
  lastViewedAt: string | null
}

export interface DossierAnalytics {
  activeRecipients: number
  totalViews: number
  avgSessionDurationSeconds: number | null
  perRecipient: PerRecipientAnalytics[]
}

export function getAnalytics(dossierId: string): Promise<DossierAnalytics> {
  return apiRequest<DossierAnalytics>(
    `/v1/dossiers/${encodeURIComponent(dossierId)}/analytics`,
  )
}
