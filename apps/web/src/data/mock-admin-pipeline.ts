// Static mock fixture for the Story 5.1 admin pipeline dashboard. Replaced
// by Epic 9.4's real admin analytics API (architecture.md:602-605 — admin
// module) when data persistence lands.

export interface MockPipelineSector {
  readonly name: string
  readonly dossierCount: number
}

export interface MockAdminPipeline {
  readonly totalDossiers: number
  readonly activeThisMonth: number
  readonly sectors: readonly MockPipelineSector[]
}

export const MOCK_ADMIN_PIPELINE: MockAdminPipeline = {
  totalDossiers: 12,
  activeThisMonth: 5,
  sectors: [
    { name: 'Biotech', dossierCount: 4 },
    { name: 'Agri-tech', dossierCount: 3 },
    { name: 'Fintech', dossierCount: 3 },
    { name: 'Autre', dossierCount: 2 },
  ],
} as const
