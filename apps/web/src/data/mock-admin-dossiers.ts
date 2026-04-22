// Static mock fixture for the Story 5.2 admin dossiers list + read view.
// Replaced by Epic 9.1's real admin dossier access endpoint (architecture.md:769-771 —
// DossiersService.adminUpdate + admin module) when data persistence lands.

import type { MockDossier } from './mock-dossiers'
import { MOCK_DOSSIER_DETAIL } from './mock-dossier'

export interface MockAdminDossier extends MockDossier {
  readonly entrepreneurEmail: string
  readonly answers?: Readonly<Record<string, string>>
}

export const MOCK_ADMIN_DOSSIERS: readonly MockAdminDossier[] = [
  {
    slug: 'biosensio',
    name: 'Biosensio',
    sector: 'DeepTech',
    maturity: 'Pre-seed',
    activeShareLinksCount: 2,
    createdAt: '2026-04-18T09:00:00.000Z',
    entrepreneurEmail: 'sophie@biosensio.fr',
    answers: MOCK_DOSSIER_DETAIL.answers,
  },
  {
    slug: 'agrotrack',
    name: 'Agrotrack',
    sector: 'AgriTech',
    maturity: 'Amorçage',
    activeShareLinksCount: 0,
    createdAt: '2026-04-10T14:30:00.000Z',
    entrepreneurEmail: 'lucas@agrotrack.fr',
  },
  {
    slug: 'neuroflow',
    name: 'NeuroFlow',
    sector: 'Fintech',
    maturity: 'Série A',
    activeShareLinksCount: 5,
    createdAt: '2026-03-02T11:00:00.000Z',
    entrepreneurEmail: 'anna@neuroflow.io',
  },
  {
    slug: 'heliosfarm',
    name: 'HeliosFarm',
    sector: 'AgriTech',
    maturity: 'Idée',
    activeShareLinksCount: 0,
    createdAt: '2026-04-15T08:00:00.000Z',
    entrepreneurEmail: 'marc@heliosfarm.fr',
  },
  {
    slug: 'quillo',
    name: 'Quillo',
    sector: 'Autre',
    maturity: 'Pre-seed',
    activeShareLinksCount: 1,
    createdAt: '2026-02-14T16:45:00.000Z',
    entrepreneurEmail: 'lea@quillo.eu',
  },
] as const
