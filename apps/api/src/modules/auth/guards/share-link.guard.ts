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

export interface AugmentedRequest extends Request {
  shareLink?: ShareLink
}

function denyAccess(): never {
  throw new ForbiddenException({ code: 'ACCESS_DENIED', message: 'Access denied.' })
}

@Injectable()
export class ShareLinkGuard implements CanActivate {
  private readonly logger = new Logger(ShareLinkGuard.name)

  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AugmentedRequest>()
    const token = request.params?.token

    if (typeof token !== 'string' || token.length === 0) {
      denyAccess()
    }

    let shareLink: ShareLink | null
    try {
      shareLink = await this.prisma.shareLink.findUnique({ where: { token } })
    } catch (err) {
      this.logger.warn(
        `ShareLinkGuard lookup failed: ${err instanceof Error ? err.message : String(err)}`,
      )
      denyAccess()
    }

    if (!shareLink || shareLink.status !== 'active') {
      denyAccess()
    }

    request.shareLink = shareLink
    return true
  }
}
