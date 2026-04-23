import { Injectable, NotFoundException } from '@nestjs/common'
import type { Request } from 'express'
import type { ShareLink } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import { AuditService } from '../audit/audit.service'

export interface FinanceurShareResponse {
  dossier: { id: string; name: string; slug: string }
  share: { recipientEmail: string; status: string }
}

@Injectable()
export class ShareLinksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
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
}
