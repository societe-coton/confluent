import { Test } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { UnauthorizedException } from '@nestjs/common'
import { AuthService } from './auth.service'
import { PrismaService } from '../../prisma/prisma.service'
import { AuditService } from '../audit/audit.service'
import { EMAIL_TRANSPORT, type EmailTransport } from './email/email-transport'

function buildModule(overrides?: {
  findUnique?: jest.Mock
  userUpdate?: jest.Mock
  tokenFindUnique?: jest.Mock
  tokenUpdate?: jest.Mock
  sendMagicLink?: jest.Mock
  sendShareInvite?: jest.Mock
  signAsync?: jest.Mock
  verifyAsync?: jest.Mock
  auditRecord?: jest.Mock
  configValues?: Record<string, string>
}) {
  const prismaMock = {
    user: {
      findUnique: overrides?.findUnique ?? jest.fn().mockResolvedValue(null),
      update: overrides?.userUpdate ?? jest.fn().mockResolvedValue({}),
    },
    magicLinkToken: {
      create: jest.fn().mockResolvedValue({}),
      findUnique: overrides?.tokenFindUnique ?? jest.fn().mockResolvedValue(null),
      update: overrides?.tokenUpdate ?? jest.fn().mockResolvedValue({}),
    },
  }
  const emailMock: EmailTransport = {
    sendMagicLink: overrides?.sendMagicLink ?? jest.fn().mockResolvedValue(undefined),
    sendShareInvite: overrides?.sendShareInvite ?? jest.fn().mockResolvedValue(undefined),
  }
  const auditMock = {
    record: overrides?.auditRecord ?? jest.fn().mockResolvedValue(undefined),
  }
  const values: Record<string, string> = {
    FRONTEND_URL: 'http://localhost:5173',
    SMTP_FROM: 'noreply@confluent.local',
    JWT_SECRET: 'access-secret-key',
    JWT_REFRESH_SECRET: 'refresh-secret-key',
    NODE_ENV: 'test',
    ...(overrides?.configValues ?? {}),
  }
  const configMock = { get: (k: string) => values[k] }
  const jwtMock = {
    signAsync: overrides?.signAsync ?? jest.fn().mockResolvedValue('signed.jwt.token'),
    verifyAsync: overrides?.verifyAsync ?? jest.fn(),
  }
  return { prismaMock, emailMock, configMock, jwtMock, auditMock }
}

async function instantiate(mocks: ReturnType<typeof buildModule>): Promise<AuthService> {
  const moduleRef = await Test.createTestingModule({
    providers: [
      AuthService,
      { provide: PrismaService, useValue: mocks.prismaMock },
      { provide: ConfigService, useValue: mocks.configMock },
      { provide: JwtService, useValue: mocks.jwtMock },
      { provide: EMAIL_TRANSPORT, useValue: mocks.emailMock },
      { provide: AuditService, useValue: mocks.auditMock },
    ],
  }).compile()
  return moduleRef.get(AuthService)
}

describe('AuthService.requestMagicLink', () => {
  it('writes a token row and sends an email when the user exists', async () => {
    const user = { id: 'user-1', email: 'sophie@biosensio.fr', locale: 'fr' }
    const mocks = buildModule({ findUnique: jest.fn().mockResolvedValue(user) })
    const service = await instantiate(mocks)

    await service.requestMagicLink('Sophie@Biosensio.FR')

    expect(mocks.prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'sophie@biosensio.fr' },
    })
    expect(mocks.prismaMock.magicLinkToken.create).toHaveBeenCalledTimes(1)
    const createArg = mocks.prismaMock.magicLinkToken.create.mock.calls[0][0] as {
      data: { userId: string; token: string; expiresAt: Date }
    }
    expect(createArg.data.userId).toBe('user-1')
    expect(createArg.data.token).toMatch(/^[0-9a-f-]{36}$/)
    const deltaMs = createArg.data.expiresAt.getTime() - Date.now()
    expect(deltaMs).toBeGreaterThan(14 * 60 * 1000)
    expect(deltaMs).toBeLessThanOrEqual(15 * 60 * 1000 + 2000)

    expect(mocks.emailMock.sendMagicLink).toHaveBeenCalledTimes(1)
    const sendArg = (mocks.emailMock.sendMagicLink as jest.Mock).mock.calls[0][0] as {
      to: string
      magicLinkUrl: string
      locale: string
    }
    expect(sendArg.to).toBe('sophie@biosensio.fr')
    expect(sendArg.locale).toBe('fr')
    expect(sendArg.magicLinkUrl).toBe(
      `http://localhost:5173/auth/verify?token=${createArg.data.token}`,
    )
  })

  it('silently no-ops when the user does not exist', async () => {
    const mocks = buildModule({ findUnique: jest.fn().mockResolvedValue(null) })
    const service = await instantiate(mocks)

    await service.requestMagicLink('unknown@example.com')

    expect(mocks.prismaMock.magicLinkToken.create).not.toHaveBeenCalled()
    expect(mocks.emailMock.sendMagicLink).not.toHaveBeenCalled()
  })

  it('does not rethrow when the email transport fails', async () => {
    const user = { id: 'user-1', email: 'sophie@biosensio.fr', locale: 'fr' }
    const mocks = buildModule({
      findUnique: jest.fn().mockResolvedValue(user),
      sendMagicLink: jest.fn().mockRejectedValue(new Error('smtp down')),
    })
    const service = await instantiate(mocks)

    await expect(service.requestMagicLink('sophie@biosensio.fr')).resolves.toBeUndefined()
    expect(mocks.prismaMock.magicLinkToken.create).toHaveBeenCalledTimes(1)
  })

  it('normalizes the email (lowercase + trim) before the lookup', async () => {
    const mocks = buildModule()
    const service = await instantiate(mocks)

    await service.requestMagicLink('   Foo@Bar.COM   ')

    expect(mocks.prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'foo@bar.com' },
    })
  })
})

describe('AuthService.verifyMagicLink', () => {
  const validTokenRow = {
    id: 'mlt-1',
    expiresAt: new Date(Date.now() + 60_000),
    consumedAt: null,
    user: {
      id: 'user-1',
      email: 'sophie@biosensio.fr',
      role: 'entrepreneur' as const,
      emailVerifiedAt: new Date('2026-01-01T00:00:00Z'),
    },
  }

  it('consumes the token and returns an issued session for a valid token', async () => {
    const mocks = buildModule({
      tokenFindUnique: jest.fn().mockResolvedValue(validTokenRow),
    })
    const service = await instantiate(mocks)

    const session = await service.verifyMagicLink('a-uuid')

    expect(mocks.prismaMock.magicLinkToken.update).toHaveBeenCalledWith({
      where: { id: 'mlt-1' },
      data: { consumedAt: expect.any(Date) },
    })
    expect(mocks.jwtMock.signAsync).toHaveBeenCalledTimes(2)
    expect(session.accessToken).toBe('signed.jwt.token')
    expect(session.refreshToken).toBe('signed.jwt.token')
    expect(session.user).toEqual({
      id: 'user-1',
      email: 'sophie@biosensio.fr',
      role: 'entrepreneur',
    })
  })

  it('sets emailVerifiedAt when the user had not verified before', async () => {
    const mocks = buildModule({
      tokenFindUnique: jest.fn().mockResolvedValue({
        ...validTokenRow,
        user: { ...validTokenRow.user, emailVerifiedAt: null },
      }),
    })
    const service = await instantiate(mocks)

    await service.verifyMagicLink('first-time')

    expect(mocks.prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { emailVerifiedAt: expect.any(Date) },
    })
  })

  it('does not touch emailVerifiedAt for a user already verified', async () => {
    const mocks = buildModule({
      tokenFindUnique: jest.fn().mockResolvedValue(validTokenRow),
    })
    const service = await instantiate(mocks)

    await service.verifyMagicLink('repeat')

    expect(mocks.prismaMock.user.update).not.toHaveBeenCalled()
  })

  it('records a magic_link_consumed audit event', async () => {
    const mocks = buildModule({
      tokenFindUnique: jest.fn().mockResolvedValue(validTokenRow),
    })
    const service = await instantiate(mocks)

    await service.verifyMagicLink('ok')

    expect(mocks.auditMock.record).toHaveBeenCalledWith({
      actionType: 'magic_link_consumed',
      actorId: 'user-1',
      metadata: { tokenId: 'mlt-1' },
    })
  })

  it('rejects unknown tokens with UnauthorizedException', async () => {
    const mocks = buildModule({ tokenFindUnique: jest.fn().mockResolvedValue(null) })
    const service = await instantiate(mocks)
    await expect(service.verifyMagicLink('nope')).rejects.toBeInstanceOf(UnauthorizedException)
  })

  it('rejects expired tokens', async () => {
    const mocks = buildModule({
      tokenFindUnique: jest.fn().mockResolvedValue({
        ...validTokenRow,
        expiresAt: new Date(Date.now() - 60_000),
      }),
    })
    const service = await instantiate(mocks)
    await expect(service.verifyMagicLink('expired')).rejects.toBeInstanceOf(UnauthorizedException)
  })

  it('rejects already-consumed tokens', async () => {
    const mocks = buildModule({
      tokenFindUnique: jest.fn().mockResolvedValue({
        ...validTokenRow,
        consumedAt: new Date(),
      }),
    })
    const service = await instantiate(mocks)
    await expect(service.verifyMagicLink('used')).rejects.toBeInstanceOf(UnauthorizedException)
  })
})

describe('AuthService.refreshSession', () => {
  it('rejects a missing cookie', async () => {
    const mocks = buildModule()
    const service = await instantiate(mocks)
    await expect(service.refreshSession(undefined)).rejects.toBeInstanceOf(UnauthorizedException)
  })

  it('rejects an invalid signature', async () => {
    const mocks = buildModule({
      verifyAsync: jest.fn().mockRejectedValue(new Error('bad signature')),
    })
    const service = await instantiate(mocks)
    await expect(service.refreshSession('bad.refresh')).rejects.toBeInstanceOf(
      UnauthorizedException,
    )
  })

  it('rejects when the underlying user is missing or inactive', async () => {
    const mocks = buildModule({
      verifyAsync: jest.fn().mockResolvedValue({ sub: 'user-1', tokenVersion: 0 }),
      findUnique: jest.fn().mockResolvedValue({
        id: 'user-1',
        isActive: false,
        email: 'x',
        role: 'entrepreneur',
        emailVerifiedAt: new Date(),
      }),
    })
    const service = await instantiate(mocks)
    await expect(service.refreshSession('ok.refresh')).rejects.toBeInstanceOf(UnauthorizedException)
  })

  it('rejects when emailVerifiedAt is null (never-verified user)', async () => {
    const mocks = buildModule({
      verifyAsync: jest.fn().mockResolvedValue({ sub: 'user-1', tokenVersion: 0 }),
      findUnique: jest.fn().mockResolvedValue({
        id: 'user-1',
        isActive: true,
        email: 'pending@example.com',
        role: 'financeur',
        emailVerifiedAt: null,
      }),
    })
    const service = await instantiate(mocks)
    await expect(service.refreshSession('ok.refresh')).rejects.toBeInstanceOf(UnauthorizedException)
  })

  it('issues a fresh session pair on a valid refresh', async () => {
    const mocks = buildModule({
      verifyAsync: jest.fn().mockResolvedValue({ sub: 'user-1', tokenVersion: 0 }),
      findUnique: jest.fn().mockResolvedValue({
        id: 'user-1',
        isActive: true,
        email: 'sophie@biosensio.fr',
        role: 'entrepreneur',
        emailVerifiedAt: new Date(),
      }),
    })
    const service = await instantiate(mocks)
    const session = await service.refreshSession('good.refresh')
    expect(session.user.id).toBe('user-1')
    expect(mocks.jwtMock.signAsync).toHaveBeenCalledTimes(2)
  })
})
