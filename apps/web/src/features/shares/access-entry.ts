export type AccessStatus = 'active' | 'pending' | 'revoked'
export type AccessLevel = 'public' | 'partiel' | 'complet'

interface AccessEntryBase {
  readonly id: string
  readonly email: string
  readonly initials: string
  readonly lastSeen: string
  readonly sessionDuration: string
  readonly accessLevel: AccessLevel
}

export type AccessEntry =
  | (AccessEntryBase & { readonly status: 'active' | 'pending' })
  | (AccessEntryBase & {
      readonly status: 'revoked'
      readonly revokedAt: string
      readonly revokedAtIso: string
      readonly revokedBy: string
    })

export function deriveInitials(email: string): string {
  const localPart = email.split('@')[0] ?? ''
  const alpha = localPart.replace(/[^a-zA-Z]+/g, '').toUpperCase()
  if (alpha.length >= 2) return alpha.slice(0, 2)
  if (alpha.length === 1) return `${alpha}·`
  return '··'
}
