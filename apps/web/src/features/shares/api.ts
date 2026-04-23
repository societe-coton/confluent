import type { ShareLink } from '@confluent/shared'
import { apiRequest } from '@/lib/api-client'

export function listShares(dossierId: string): Promise<ShareLink[]> {
  return apiRequest<ShareLink[]>(
    `/v1/dossiers/${encodeURIComponent(dossierId)}/shares`,
  )
}

export function createShare(
  dossierId: string,
  recipientEmail: string,
): Promise<ShareLink & { shareUrl: string }> {
  return apiRequest<ShareLink & { shareUrl: string }>(
    `/v1/dossiers/${encodeURIComponent(dossierId)}/shares`,
    { method: 'POST', body: JSON.stringify({ recipientEmail }) },
  )
}

export function revokeShare(dossierId: string, linkId: string): Promise<ShareLink> {
  return apiRequest<ShareLink>(
    `/v1/dossiers/${encodeURIComponent(dossierId)}/shares/${encodeURIComponent(linkId)}`,
    { method: 'DELETE' },
  )
}
