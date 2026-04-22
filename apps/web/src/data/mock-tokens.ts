// Static mock fixture for the Story 4.4 token guard. Replaced by Epic 6.4's
// NestJS share-link guard (architecture.md:561 — 'share-link.guard.ts') when
// real API wiring lands.

export const VALID_SHARE_TOKENS = ['biosensio-share', 'valid-token-1'] as const

export type ValidShareToken = (typeof VALID_SHARE_TOKENS)[number]

export function isValidShareToken(
  token: string | undefined,
): token is ValidShareToken {
  if (token === undefined) return false
  return (VALID_SHARE_TOKENS as readonly string[]).includes(token)
}
