// Static analytics fixture for the entrepreneur dossier analytics tab (Story 3.3).
// Slug-agnostic in Epic 3 — every dossier renders the same metrics + entries.
// Per-dossier fan-out lands in Story 8.3 via GET /v1/dossiers/:id/analytics.

export type AccessStatus = 'active' | 'pending' | 'revoked'

interface AccessEntryBase {
  readonly email: string
  readonly initials: string
  readonly lastSeen: string
  readonly sessionDuration: string
}

// Discriminated union: `revoked` requires `revokedAt`, preventing
// "Révoqué le undefined" renders.
export type AccessEntry =
  | (AccessEntryBase & { readonly status: 'active' | 'pending' })
  | (AccessEntryBase & { readonly status: 'revoked'; readonly revokedAt: string })

export interface AnalyticsMetric {
  readonly label: string
  readonly value: string
}

export interface Analytics {
  readonly metrics: readonly [AnalyticsMetric, AnalyticsMetric, AnalyticsMetric]
  readonly accessEntries: readonly AccessEntry[]
}

export const MOCK_ANALYTICS: Analytics = {
  metrics: [
    { label: 'Destinataires actifs', value: '2' },
    { label: 'Vues totales', value: '7' },
    { label: 'Durée moy. de session', value: '4m 32s' },
  ],
  accessEntries: [
    {
      email: 'arc@capital.fr',
      initials: 'AC',
      status: 'active',
      lastSeen: 'Dernière session : il y a 2 jours · 3 vues',
      sessionDuration: '6m 14s',
    },
    {
      email: 'martin@fund.io',
      initials: 'MF',
      status: 'pending',
      lastSeen: 'Invitation envoyée il y a 3 h',
      sessionDuration: '—',
    },
    {
      email: 'lea@invest.com',
      initials: 'LI',
      status: 'revoked',
      lastSeen: 'Dernière session : il y a 5 jours · 2 vues',
      sessionDuration: '3m 41s',
      revokedAt: '16 avr. 2026',
    },
  ],
} as const
