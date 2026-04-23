import { ExecutionContext, ForbiddenException } from '@nestjs/common'
import { ShareLinkGuard } from './share-link.guard'
import { PrismaService } from '../../../prisma/prisma.service'

function buildContext(token: unknown): { ctx: ExecutionContext; req: Record<string, unknown> } {
  const req: Record<string, unknown> = { params: { token } }
  const ctx = {
    switchToHttp: () => ({ getRequest: <T>() => req as T }),
  } as ExecutionContext
  return { ctx, req }
}

function makeGuard(findUnique: jest.Mock): ShareLinkGuard {
  const prisma = { shareLink: { findUnique } } as unknown as PrismaService
  return new ShareLinkGuard(prisma)
}

describe('ShareLinkGuard', () => {
  it('allows and attaches the record for an active share link', async () => {
    const record = { id: 'sl-1', token: 't', status: 'active', dossierId: 'd-1' }
    const { ctx, req } = buildContext('t')
    const guard = makeGuard(jest.fn().mockResolvedValue(record))
    await expect(guard.canActivate(ctx)).resolves.toBe(true)
    expect(req.shareLink).toEqual(record)
  })

  it.each(['pending', 'revoked', 'expired'] as const)('denies a %s share link', async (status) => {
    const { ctx } = buildContext('t')
    const guard = makeGuard(
      jest.fn().mockResolvedValue({ id: 'sl-1', token: 't', status, dossierId: 'd-1' }),
    )
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(ForbiddenException)
  })

  it('denies when the token does not match any row', async () => {
    const { ctx } = buildContext('t')
    const guard = makeGuard(jest.fn().mockResolvedValue(null))
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(ForbiddenException)
  })

  it('wraps DB errors into a generic 403', async () => {
    const { ctx } = buildContext('t')
    const guard = makeGuard(jest.fn().mockRejectedValue(new Error('pg down')))
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(ForbiddenException)
  })

  it('denies when no token is in the URL', async () => {
    const { ctx } = buildContext(undefined)
    const guard = makeGuard(jest.fn())
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(ForbiddenException)
  })
})
