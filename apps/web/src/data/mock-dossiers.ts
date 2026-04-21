// Static mock fixture for the entrepreneur dashboard (Story 3.1).
// Array order IS render order — newest first. `createdAt` uses hardcoded
// ISO strings so the "il y a N jours" copy stays deterministic across
// sessions. Story 3.2 is expected to consume the same `MockDossier` type
// when it wires the dossier view to this fixture.

export interface MockDossier {
  readonly slug: string
  readonly name: string
  readonly sector: string
  readonly maturity: string
  readonly activeShareLinksCount: number
  readonly createdAt: string
}

export const MOCK_DOSSIERS: readonly MockDossier[] = [
  {
    slug: 'biosensio',
    name: 'Biosensio',
    sector: 'DeepTech',
    maturity: 'Pre-seed',
    activeShareLinksCount: 2,
    createdAt: '2026-04-18T09:00:00.000Z',
  },
  {
    slug: 'agrotrack',
    name: 'Agrotrack',
    sector: 'AgriTech',
    maturity: 'Amorçage',
    activeShareLinksCount: 0,
    createdAt: '2026-04-10T14:30:00.000Z',
  },
] as const
