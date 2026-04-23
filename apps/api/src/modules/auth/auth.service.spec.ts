import { Test } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { AuthService } from './auth.service'
import { PrismaService } from '../../prisma/prisma.service'
import { EMAIL_TRANSPORT, type EmailTransport } from './email/email-transport'

type FindUnique = jest.Mock<Promise<{ id: string; email: string } | null>, [unknown]>
type Create = jest.Mock<Promise<unknown>, [unknown]>

interface PrismaMock {
  user: { findUnique: FindUnique }
  magicLinkToken: { create: Create }
}

function buildModule(overrides?: {
  findUnique?: FindUnique
  sendMail?: jest.Mock<Promise<void>, [unknown]>
  configValues?: Record<string, string>
}) {
  const prismaMock: PrismaMock = {
    user: { findUnique: overrides?.findUnique ?? jest.fn().mockResolvedValue(null) },
    magicLinkToken: { create: jest.fn().mockResolvedValue({}) },
  }
  const emailMock: EmailTransport = {
    sendMail: overrides?.sendMail ?? jest.fn().mockResolvedValue(undefined),
  }
  const values: Record<string, string> = {
    FRONTEND_URL: 'http://localhost:5173',
    SMTP_FROM: 'noreply@confluent.local',
    ...(overrides?.configValues ?? {}),
  }
  const configMock = { get: (k: string) => values[k] }
  return { prismaMock, emailMock, configMock }
}

async function instantiate(mocks: ReturnType<typeof buildModule>): Promise<AuthService> {
  const moduleRef = await Test.createTestingModule({
    providers: [
      AuthService,
      { provide: PrismaService, useValue: mocks.prismaMock },
      { provide: ConfigService, useValue: mocks.configMock },
      { provide: EMAIL_TRANSPORT, useValue: mocks.emailMock },
    ],
  }).compile()
  return moduleRef.get(AuthService)
}

describe('AuthService.requestMagicLink', () => {
  it('writes a token row and sends an email when the user exists', async () => {
    const user = { id: 'user-1', email: 'sophie@biosensio.fr' }
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

    expect(mocks.emailMock.sendMail).toHaveBeenCalledTimes(1)
    const mailArg = (mocks.emailMock.sendMail as jest.Mock).mock.calls[0][0] as {
      to: string
      text: string
      html: string
      subject: string
      from: string
    }
    expect(mailArg.to).toBe('sophie@biosensio.fr')
    expect(mailArg.from).toBe('noreply@confluent.local')
    expect(mailArg.subject).toBe('Votre lien de connexion Confluent')
    expect(mailArg.text).toContain(
      `http://localhost:5173/auth/verify?token=${createArg.data.token}`,
    )
    expect(mailArg.html).toContain(createArg.data.token)
  })

  it('silently no-ops when the user does not exist', async () => {
    const mocks = buildModule({ findUnique: jest.fn().mockResolvedValue(null) })
    const service = await instantiate(mocks)

    await service.requestMagicLink('unknown@example.com')

    expect(mocks.prismaMock.magicLinkToken.create).not.toHaveBeenCalled()
    expect(mocks.emailMock.sendMail).not.toHaveBeenCalled()
  })

  it('does not rethrow when the email transport fails', async () => {
    const user = { id: 'user-1', email: 'sophie@biosensio.fr' }
    const mocks = buildModule({
      findUnique: jest.fn().mockResolvedValue(user),
      sendMail: jest.fn().mockRejectedValue(new Error('smtp down')),
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
