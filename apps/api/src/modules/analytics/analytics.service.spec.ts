import { Test } from '@nestjs/testing'
import { AnalyticsService } from './analytics.service'
import { PrismaService } from '../../prisma/prisma.service'

async function instantiate(
  shareLinks: Array<{ id: string; status: string; recipientEmail: string }>,
  viewEvents: Array<{ shareLinkId: string | null; createdAt: Date }>,
): Promise<AnalyticsService> {
  const moduleRef = await Test.createTestingModule({
    providers: [
      AnalyticsService,
      {
        provide: PrismaService,
        useValue: {
          shareLink: { findMany: jest.fn().mockResolvedValue(shareLinks) },
          auditLog: { findMany: jest.fn().mockResolvedValue(viewEvents) },
        },
      },
    ],
  }).compile()
  return moduleRef.get(AnalyticsService)
}

describe('AnalyticsService.forDossier', () => {
  it('returns zero counts + empty perRecipient when no shares', async () => {
    const svc = await instantiate([], [])
    const result = await svc.forDossier('d-1')
    expect(result).toEqual({
      activeRecipients: 0,
      totalViews: 0,
      avgSessionDurationSeconds: null,
      perRecipient: [],
    })
  })

  it('aggregates per-recipient view counts and lastViewedAt', async () => {
    const shareLinks = [
      { id: 'sl-1', status: 'active', recipientEmail: 'a@x.fr' },
      { id: 'sl-2', status: 'revoked', recipientEmail: 'b@x.fr' },
    ]
    const viewEvents = [
      { shareLinkId: 'sl-1', createdAt: new Date('2026-04-20T10:00:00Z') },
      { shareLinkId: 'sl-1', createdAt: new Date('2026-04-21T12:00:00Z') },
      { shareLinkId: 'sl-2', createdAt: new Date('2026-04-19T09:00:00Z') },
    ]
    const svc = await instantiate(shareLinks, viewEvents)
    const result = await svc.forDossier('d-1')
    expect(result.activeRecipients).toBe(1)
    expect(result.totalViews).toBe(3)
    expect(result.perRecipient).toHaveLength(2)
    const r1 = result.perRecipient.find((r) => r.shareLinkId === 'sl-1')!
    expect(r1.viewCount).toBe(2)
    expect(r1.lastViewedAt?.toISOString()).toBe('2026-04-21T12:00:00.000Z')
  })

  it('returns null lastViewedAt for share links that were never viewed', async () => {
    const svc = await instantiate([{ id: 'sl-3', status: 'active', recipientEmail: 'c@x.fr' }], [])
    const result = await svc.forDossier('d-1')
    expect(result.perRecipient[0].viewCount).toBe(0)
    expect(result.perRecipient[0].lastViewedAt).toBeNull()
  })
})
