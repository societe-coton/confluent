import { ExecutionContext, ForbiddenException } from '@nestjs/common'
import { ShareLinkGuard } from './share-link.guard'
import { PrismaService } from '../../../prisma/prisma.service'
import { AuditService } from '../../audit/audit.service'

function buildContext(token: unknown): { ctx: ExecutionContext; req: Record<string, unknown> } {
  const req: Record<string, unknown> = { params: { token }, headers: {}, ip: '127.0.0.1' }
  const ctx = {
    switchToHttp: () => ({ getRequest: <T>() => req as T }),
  } as ExecutionContext
  return { ctx, req }
}

function makeGuard(findUnique: jest.Mock): { guard: ShareLinkGuard; audit: { record: jest.Mock } } {
  const prisma = { shareLink: { findUnique } } as unknown as PrismaService
  const audit = { record: jest.fn().mockResolvedValue(undefined) }
  const guard = new ShareLinkGuard(prisma, audit as unknown as AuditService)
  return { guard, audit }
}

describe('ShareLinkGuard', () => {
  it('allows and attaches the record for an active share link — no deny audit', async () => {
    const record = { id: 'sl-1', token: 't', status: 'active', dossierId: 'd-1' }
    const { ctx, req } = buildContext('t')
    const { guard, audit } = makeGuard(jest.fn().mockResolvedValue(record))
    await expect(guard.canActivate(ctx)).resolves.toBe(true)
    expect(req.shareLink).toEqual(record)
    expect(audit.record).not.toHaveBeenCalled()
  })

  it.each(['pending', 'revoked', 'expired'] as const)(
    'denies a %s share link and records a hashed-token audit',
    async (status) => {
      const { ctx } = buildContext('tok')
      const { guard, audit } = makeGuard(
        jest.fn().mockResolvedValue({ id: 'sl-1', token: 'tok', status, dossierId: 'd-1' }),
      )
      await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(ForbiddenException)
      expect(audit.record).toHaveBeenCalledWith(
        expect.objectContaining({
          actionType: 'share_link_access_denied',
          shareLinkId: 'sl-1',
          metadata: expect.objectContaining({ reason: status }),
        }),
      )
      const call = audit.record.mock.calls[0][0] as { metadata: { tokenHash: string } }
      expect(call.metadata.tokenHash).toMatch(/^[0-9a-f]{64}$/)
    },
  )

  it('denies unknown tokens with reason not_found', async () => {
    const { ctx } = buildContext('t')
    const { guard, audit } = makeGuard(jest.fn().mockResolvedValue(null))
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(ForbiddenException)
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({ metadata: expect.objectContaining({ reason: 'not_found' }) }),
    )
  })

  it('denies with reason lookup_error when DB throws', async () => {
    const { ctx } = buildContext('t')
    const { guard, audit } = makeGuard(jest.fn().mockRejectedValue(new Error('pg down')))
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(ForbiddenException)
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({ metadata: expect.objectContaining({ reason: 'lookup_error' }) }),
    )
  })

  it('denies with reason missing_token when no token is in the URL', async () => {
    const { ctx } = buildContext(undefined)
    const { guard, audit } = makeGuard(jest.fn())
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(ForbiddenException)
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({ metadata: expect.objectContaining({ reason: 'missing_token' }) }),
    )
  })
})
