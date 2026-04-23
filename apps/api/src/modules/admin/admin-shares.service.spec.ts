import { Test } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { AdminSharesService } from './admin-shares.service'
import { PrismaService } from '../../prisma/prisma.service'
import { AuditService } from '../audit/audit.service'

async function instantiate(
  findUnique: jest.Mock,
  update: jest.Mock = jest.fn(),
  audit: jest.Mock = jest.fn().mockResolvedValue(undefined),
): Promise<{ svc: AdminSharesService; audit: jest.Mock; update: jest.Mock }> {
  const moduleRef = await Test.createTestingModule({
    providers: [
      AdminSharesService,
      { provide: PrismaService, useValue: { shareLink: { findUnique, update } } },
      { provide: AuditService, useValue: { record: audit } },
    ],
  }).compile()
  return { svc: moduleRef.get(AdminSharesService), audit, update }
}

describe('AdminSharesService.revoke', () => {
  it('revokes the link and writes admin_revoked_share_link audit', async () => {
    const existing = {
      id: 'sl-1',
      dossierId: 'd-1',
      recipientEmail: 'bob@invest.fr',
      status: 'active',
    }
    const updated = { ...existing, status: 'revoked', revokedAt: new Date() }
    const { svc, audit } = await instantiate(
      jest.fn().mockResolvedValue(existing),
      jest.fn().mockResolvedValue(updated),
    )

    const result = await svc.revoke('d-1', 'sl-1', 'admin-1')
    expect(result.status).toBe('revoked')
    expect(audit).toHaveBeenCalledWith(
      expect.objectContaining({
        actionType: 'admin_revoked_share_link',
        actorId: 'admin-1',
        shareLinkId: 'sl-1',
      }),
    )
  })

  it('throws 404 when the link does not exist', async () => {
    const { svc } = await instantiate(jest.fn().mockResolvedValue(null))
    await expect(svc.revoke('d-1', 'sl-1', 'admin-1')).rejects.toBeInstanceOf(NotFoundException)
  })

  it('throws 404 when the link belongs to a different dossier', async () => {
    const { svc } = await instantiate(
      jest.fn().mockResolvedValue({ id: 'sl-1', dossierId: 'd-other' }),
    )
    await expect(svc.revoke('d-1', 'sl-1', 'admin-1')).rejects.toBeInstanceOf(NotFoundException)
  })
})
