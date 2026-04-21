// Relative-date formatter used by the dashboard dossier list (Story 3.1).
// Test vectors (relative to 2026-04-21T00:00:00Z) — `numeric: 'auto'` uses
// the French locale's idiomatic forms at ±1 ("hier" / "le mois dernier" /
// "l’année dernière"):
//   "2026-04-21T09:00:00.000Z" → "aujourd’hui"
//   "2026-04-20T09:00:00.000Z" → "hier"
//   "2026-04-18T09:00:00.000Z" → "il y a 3 jours"
//   "2026-04-10T14:30:00.000Z" → "il y a 10 jours"
//   "2026-03-18T09:00:00.000Z" → "le mois dernier"
//   "2025-04-18T09:00:00.000Z" → "l’année dernière"
//   ""                         → "" (invalid input)
//   "not-a-date"               → ""

const MS_PER_DAY = 86_400_000

export function formatRelativeDate(iso: string, now: Date = new Date()): string {
  const then = new Date(iso).getTime()
  if (!Number.isFinite(then)) return ''
  const diffMs = then - now.getTime()
  const diffDays = Math.round(diffMs / MS_PER_DAY)
  const rtf = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' })
  if (Math.abs(diffDays) < 30) return rtf.format(diffDays, 'day')
  const diffMonths = Math.round(diffDays / 30)
  if (Math.abs(diffMonths) < 12) return rtf.format(diffMonths, 'month')
  const diffYears = Math.round(diffMonths / 12)
  return rtf.format(diffYears, 'year')
}
