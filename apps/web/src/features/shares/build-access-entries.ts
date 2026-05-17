import type { PerRecipientAnalytics, ShareLink } from '@confluent/shared'
import { deriveInitials, type AccessEntry } from './access-entry'

function formatRevokedAt(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatLastSeen(analytics: PerRecipientAnalytics | undefined, status: string): string {
  if (analytics && analytics.viewCount > 0 && analytics.lastViewedAt) {
    const date = new Date(analytics.lastViewedAt)
    const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
    const views = `${analytics.viewCount} vue${analytics.viewCount > 1 ? 's' : ''}`
    if (days <= 0) return `Vu aujourd'hui · ${views}`
    if (days === 1) return `Vu hier · ${views}`
    return `Vu il y a ${days} jours · ${views}`
  }
  if (status === 'pending') return 'Invitation envoyée'
  if (status === 'revoked') return 'Accès révoqué'
  return 'Aucune session enregistrée'
}

export function buildAccessEntries(
  shares: ShareLink[],
  analytics: { perRecipient: PerRecipientAnalytics[] } | undefined,
): AccessEntry[] {
  const analyticsByLinkId = new Map<string, PerRecipientAnalytics>()
  for (const r of analytics?.perRecipient ?? []) {
    analyticsByLinkId.set(r.shareLinkId, r)
  }
  return shares.map((s) => {
    const a = analyticsByLinkId.get(s.id)
    const lastSeen = formatLastSeen(a, s.status)
    const base = {
      id: s.id,
      email: s.recipientEmail,
      initials: deriveInitials(s.recipientEmail),
      lastSeen,
      sessionDuration: '—',
      accessLevel: (s.accessLevel ?? 'complet') as 'public' | 'partiel' | 'complet',
    }
    if (s.status === 'revoked') {
      const revokedIso = s.revokedAt ?? new Date().toISOString()
      return {
        ...base,
        status: 'revoked',
        revokedAt: formatRevokedAt(revokedIso),
        revokedAtIso: revokedIso,
        revokedBy: '—',
      }
    }
    if (s.status === 'expired') {
      return { ...base, status: 'revoked', revokedAt: '—', revokedAtIso: s.createdAt, revokedBy: '—' }
    }
    return { ...base, status: s.status }
  })
}
