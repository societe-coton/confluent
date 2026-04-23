import { randomUUID } from 'node:crypto'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { AppConfig } from '../../config/config.schema'
import { PrismaService } from '../../prisma/prisma.service'
import { EMAIL_TRANSPORT, type EmailTransport } from './email/email-transport'

const MAGIC_LINK_TTL_MS = 15 * 60 * 1000

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService<AppConfig, true>,
    @Inject(EMAIL_TRANSPORT) private readonly email: EmailTransport,
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
    const from = this.config.get('SMTP_FROM', { infer: true })
    const verifyUrl = `${frontendUrl}/auth/verify?token=${token}`
    const subject = 'Votre lien de connexion Confluent'
    const text =
      `Bonjour,\n\nVoici votre lien de connexion (valide 15 minutes) :\n${verifyUrl}\n\n` +
      `Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.`
    const html =
      `<p>Bonjour,</p><p>Voici votre <a href="${verifyUrl}">lien de connexion</a> ` +
      `(valide 15 minutes).</p><p>Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.</p>`

    try {
      await this.email.sendMail({ to: email, from, subject, text, html })
    } catch (err) {
      this.logger.warn(
        `Magic link email dispatch failed for user ${user.id}: ` +
          (err instanceof Error ? err.message : String(err)),
      )
    }
  }
}
