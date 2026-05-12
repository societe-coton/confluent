import { randomUUID } from 'node:crypto'
import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import type { AppConfig } from '../../config/config.schema'
import { PrismaService } from '../../prisma/prisma.service'
import { AuditService } from '../audit/audit.service'
import { ACCESS_TOKEN_TTL_SECONDS, REFRESH_TOKEN_TTL_SECONDS } from './auth.constants'
import { EMAIL_TRANSPORT, type EmailTransport } from './email/email-transport'
import type { JwtPayload } from './strategies/jwt.strategy'

const MAGIC_LINK_TTL_MS = 15 * 60 * 1000

export interface IssuedSession {
  accessToken: string
  refreshToken: string
  user: { id: string; email: string; role: JwtPayload['role'] }
}

interface RefreshPayload {
  sub: string
  tokenVersion: number
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService<AppConfig, true>,
    private readonly jwt: JwtService,
    @Inject(EMAIL_TRANSPORT) private readonly email: EmailTransport,
    private readonly audit: AuditService,
  ) {}

  async requestMagicLink(rawEmail: string): Promise<void> {
    const email = rawEmail.trim().toLowerCase()
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user) {
      this.logger.debug(`magic_link.unknown_email emailLen=${email.length}`)
      return
    }

    const token = randomUUID()
    const expiresAt = new Date(Date.now() + MAGIC_LINK_TTL_MS)
    await this.prisma.magicLinkToken.create({
      data: { userId: user.id, token, expiresAt },
    })

    const frontendUrl = this.config.get('FRONTEND_URL', { infer: true })
    const verifyUrl = `${frontendUrl}/auth/verify?token=${token}`

    try {
      await this.email.sendMagicLink({
        to: email,
        magicLinkUrl: verifyUrl,
        locale: (user.locale as 'fr') ?? 'fr',
      })
    } catch (err) {
      this.logger.warn(
        `Magic link email dispatch failed for user ${user.id}: ` +
          (err instanceof Error ? err.message : String(err)),
      )
    }
  }

  async verifyMagicLink(token: string): Promise<IssuedSession> {
    const record = await this.prisma.magicLinkToken.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!record || record.consumedAt !== null || record.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException({
        code: 'INVALID_TOKEN',
        message: 'Token expired or invalid.',
      })
    }

    await this.prisma.magicLinkToken.update({
      where: { id: record.id },
      data: { consumedAt: new Date() },
    })

    if (record.user.emailVerifiedAt === null) {
      await this.prisma.user.update({
        where: { id: record.user.id },
        data: { emailVerifiedAt: new Date() },
      })
    }

    await this.audit.record({
      actionType: 'magic_link_consumed',
      actorId: record.user.id,
      metadata: { tokenId: record.id },
    })

    return this.issueSession({
      id: record.user.id,
      email: record.user.email,
      role: record.user.role,
    })
  }

  async refreshSession(refreshToken: string | undefined): Promise<IssuedSession> {
    if (!refreshToken) {
      throw new UnauthorizedException({
        code: 'INVALID_TOKEN',
        message: 'Token expired or invalid.',
      })
    }
    let payload: RefreshPayload
    try {
      payload = await this.jwt.verifyAsync<RefreshPayload>(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET', { infer: true }),
      })
    } catch {
      throw new UnauthorizedException({
        code: 'INVALID_TOKEN',
        message: 'Token expired or invalid.',
      })
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user || !user.isActive || user.emailVerifiedAt === null) {
      throw new UnauthorizedException({
        code: 'INVALID_TOKEN',
        message: 'Token expired or invalid.',
      })
    }
    return this.issueSession({ id: user.id, email: user.email, role: user.role })
  }

  private async issueSession(user: {
    id: string
    email: string
    role: JwtPayload['role']
  }): Promise<IssuedSession> {
    const accessToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email, role: user.role } satisfies JwtPayload,
      {
        secret: this.config.get('JWT_SECRET', { infer: true }),
        expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      },
    )
    const refreshToken = await this.jwt.signAsync(
      { sub: user.id, tokenVersion: 0 } satisfies RefreshPayload,
      {
        secret: this.config.get('JWT_REFRESH_SECRET', { infer: true }),
        expiresIn: REFRESH_TOKEN_TTL_SECONDS,
      },
    )
    return { accessToken, refreshToken, user }
  }
}
