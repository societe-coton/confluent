import { createHash } from 'node:crypto'
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common'
import type { Request } from 'express'
import type { ShareLink } from '@prisma/client'
import { PrismaService } from '../../../prisma/prisma.service'
import { AuditService } from '../../audit/audit.service'

export interface AugmentedRequest extends Request {
  shareLink?: ShareLink
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

@Injectable()
export class ShareLinkGuard implements CanActivate {
  private readonly logger = new Logger(ShareLinkGuard.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AugmentedRequest>()
    const rawToken = request.params?.token
    const token = typeof rawToken === 'string' ? rawToken : ''

    if (token.length === 0) {
      await this.auditDeny(token, request, 'missing_token')
      throw new ForbiddenException({ code: 'ACCESS_DENIED', message: 'Access denied.' })
    }

    let shareLink: ShareLink | null
    try {
      shareLink = await this.prisma.shareLink.findUnique({ where: { token } })
    } catch (err) {
      this.logger.warn(
        `ShareLinkGuard lookup failed: ${err instanceof Error ? err.message : String(err)}`,
      )
      await this.auditDeny(token, request, 'lookup_error')
      throw new ForbiddenException({ code: 'ACCESS_DENIED', message: 'Access denied.' })
    }

    if (!shareLink || shareLink.status !== 'active') {
      await this.auditDeny(token, request, shareLink?.status ?? 'not_found', shareLink?.id ?? null)
      throw new ForbiddenException({ code: 'ACCESS_DENIED', message: 'Access denied.' })
    }

    request.shareLink = shareLink
    return true
  }

  private async auditDeny(
    token: string,
    req: Request,
    reason: string,
    shareLinkId: string | null = null,
  ): Promise<void> {
    await this.audit.record({
      actionType: 'share_link_access_denied',
      shareLinkId,
      metadata: {
        tokenHash: token ? hashToken(token) : null,
        reason,
        ip: req.ip ?? null,
        userAgent: req.headers['user-agent'] ?? null,
      },
    })
  }
}
