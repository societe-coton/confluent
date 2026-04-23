import { Test } from '@nestjs/testing'
import { AuditService } from './audit.service'
import { PrismaService } from '../../prisma/prisma.service'

describe('AuditService.record', () => {
  it('writes an audit row via prisma.auditLog.create', async () => {
    const create = jest.fn().mockResolvedValue({})
    const moduleRef = await Test.createTestingModule({
      providers: [AuditService, { provide: PrismaService, useValue: { auditLog: { create } } }],
    }).compile()
    const service = moduleRef.get(AuditService)

    await service.record({
      actionType: 'share_link_viewed',
      shareLinkId: 'sl-1',
      dossierId: 'd-1',
      metadata: { ua: 'jest' },
    })

    expect(create).toHaveBeenCalledWith({
      data: {
        actionType: 'share_link_viewed',
        actorId: null,
        dossierId: 'd-1',
        shareLinkId: 'sl-1',
        metadata: { ua: 'jest' },
      },
    })
  })

  it('swallows write errors so the caller is never affected', async () => {
    const create = jest.fn().mockRejectedValue(new Error('pg down'))
    const moduleRef = await Test.createTestingModule({
      providers: [AuditService, { provide: PrismaService, useValue: { auditLog: { create } } }],
    }).compile()
    const service = moduleRef.get(AuditService)

    await expect(service.record({ actionType: 'share_link_viewed' })).resolves.toBeUndefined()
  })
})
