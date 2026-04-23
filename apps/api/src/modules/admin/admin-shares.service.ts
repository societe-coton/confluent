import { Injectable, NotFoundException } from '@nestjs/common'
import type { ShareLink } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import { AuditService } from '../audit/audit.service'

@Injectable()
export class AdminSharesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async revoke(dossierId: string, linkId: string, adminId: string): Promise<ShareLink> {
    const existing = await this.prisma.shareLink.findUnique({ where: { id: linkId } })
    if (!existing || existing.dossierId !== dossierId) {
      throw new NotFoundException({
        code: 'SHARE_LINK_NOT_FOUND',
        message: 'Share link not found.',
      })
    }
    const revokedAt = new Date()
    const updated = await this.prisma.shareLink.update({
      where: { id: linkId },
      data: { status: 'revoked', revokedAt },
    })
    await this.audit.record({
      actionType: 'admin_revoked_share_link',
      actorId: adminId,
      dossierId,
      shareLinkId: linkId,
      metadata: {
        recipientEmail: existing.recipientEmail,
        revokedAt: revokedAt.toISOString(),
      },
    })
    return updated
  }
}
