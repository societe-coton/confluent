import { randomUUID } from 'node:crypto'
import { Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Request } from 'express'
import type { ShareLink } from '@prisma/client'
import type { AppConfig } from '../../config/config.schema'
import { PrismaService } from '../../prisma/prisma.service'
import { AuditService } from '../audit/audit.service'
import { EMAIL_TRANSPORT, type EmailTransport } from '../auth/email/email-transport'
import { Inject } from '@nestjs/common'
import { DossiersService } from '../dossiers/dossiers.service'

export interface FinanceurShareResponse {
  dossier: { id: string; name: string; slug: string }
  share: { recipientEmail: string; status: string }
}

@Injectable()
export class ShareLinksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly config: ConfigService<AppConfig, true>,
    private readonly dossiers: DossiersService,
    @Inject(EMAIL_TRANSPORT) private readonly email: EmailTransport,
  ) {}

  async resolveForFinanceur(shareLink: ShareLink): Promise<FinanceurShareResponse> {
    const dossier = await this.prisma.dossier.findUnique({
      where: { id: shareLink.dossierId },
      select: { id: true, name: true, slug: true },
    })
    if (!dossier) {
      throw new NotFoundException({ code: 'DOSSIER_NOT_FOUND', message: 'Dossier not found.' })
    }
    return {
      dossier,
      share: { recipientEmail: shareLink.recipientEmail, status: shareLink.status },
    }
  }

  async recordView(shareLink: ShareLink, req: Request): Promise<void> {
    await this.audit.record({
      actionType: 'share_link_viewed',
      shareLinkId: shareLink.id,
      dossierId: shareLink.dossierId,
      metadata: {
        recipientEmail: shareLink.recipientEmail,
        userAgent: req.headers['user-agent'] ?? null,
        ip: req.ip ?? null,
      },
    })
  }

  async create(params: {
    dossierId: string
    userId: string
    recipientEmail: string
    accessLevel?: string
  }): Promise<ShareLink & { shareUrl: string }> {
    const dossier = await this.dossiers.getByIdForUser(params.dossierId, params.userId)
    const recipientEmail = params.recipientEmail.trim().toLowerCase()

    const existingRecipient = await this.prisma.user.findUnique({
      where: { email: recipientEmail },
    })
    const recipient =
      existingRecipient ??
      (await this.prisma.user.create({
        data: {
          email: recipientEmail,
          role: 'financeur',
          isActive: true,
          emailVerifiedAt: null,
        },
      }))
    const createdNewUser = existingRecipient === null

    const token = randomUUID()
    const link = await this.prisma.shareLink.create({
      data: {
        dossierId: dossier.id,
        recipientEmail,
        token,
        status: 'active',
        accessLevel: params.accessLevel ?? 'complet',
      },
    })
    const frontendUrl = this.config.get('FRONTEND_URL', { infer: true })
    const shareUrl = `${frontendUrl}/share/${token}`
    await this.audit.record({
      actionType: 'share_link_created',
      shareLinkId: link.id,
      dossierId: dossier.id,
      actorId: params.userId,
      metadata: {
        recipientEmail,
        recipientUserId: recipient.id,
        createdNewUser,
      },
    })
    try {
      await this.email.sendShareInvite({
        to: recipientEmail,
        dossierName: dossier.name,
        shareUrl,
        locale: (recipient.locale as 'fr') ?? 'fr',
      })
    } catch {
      // best-effort — audit already recorded
    }
    return { ...link, shareUrl }
  }

  listForDossier(dossierId: string, userId: string): Promise<ShareLink[]> {
    return this.dossiers.getByIdForUser(dossierId, userId).then(() =>
      this.prisma.shareLink.findMany({
        where: { dossierId },
        orderBy: { createdAt: 'desc' },
      }),
    )
  }

  async revoke(dossierId: string, linkId: string, userId: string): Promise<ShareLink> {
    await this.dossiers.getByIdForUser(dossierId, userId)
    const existing = await this.prisma.shareLink.findUnique({ where: { id: linkId } })
    if (!existing || existing.dossierId !== dossierId) {
      throw new NotFoundException({
        code: 'SHARE_LINK_NOT_FOUND',
        message: 'Share link not found.',
      })
    }
    const updated = await this.prisma.shareLink.update({
      where: { id: linkId },
      data: { status: 'revoked', revokedAt: new Date() },
    })
    await this.audit.record({
      actionType: 'share_link_revoked',
      shareLinkId: linkId,
      dossierId,
      actorId: userId,
    })
    return updated
  }
}
