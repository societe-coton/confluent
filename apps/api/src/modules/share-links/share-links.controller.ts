import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import type { Request } from 'express'
import type { ShareLink } from '@prisma/client'
import { createShareLinkSchema } from '@confluent/shared'
import { createZodDto } from 'nestjs-zod'
import { Public } from '../../common/decorators/public.decorator'
import { ShareLinkGuard, type AugmentedRequest } from '../auth/guards/share-link.guard'
import { ShareLinksService, type FinanceurShareResponse } from './share-links.service'
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy'

class CreateShareLinkDto extends createZodDto(createShareLinkSchema) {}

function currentUser(req: Request): AuthenticatedUser {
  return (req as Request & { user: AuthenticatedUser }).user
}

@Controller()
export class ShareLinksController {
  constructor(private readonly service: ShareLinksService) {}

  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @UseGuards(ShareLinkGuard)
  @Get('shares/:token')
  async getShare(@Req() req: Request): Promise<FinanceurShareResponse> {
    const aug = req as AugmentedRequest
    const shareLink = aug.shareLink!
    await this.service.recordView(shareLink, req)
    return this.service.resolveForFinanceur(shareLink)
  }

  @Post('dossiers/:id/shares')
  @HttpCode(201)
  create(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: CreateShareLinkDto,
  ): Promise<ShareLink & { shareUrl: string }> {
    return this.service.create({
      dossierId: id,
      userId: currentUser(req).id,
      recipientEmail: body.recipientEmail,
    })
  }

  @Get('dossiers/:id/shares')
  list(@Req() req: Request, @Param('id') id: string): Promise<ShareLink[]> {
    return this.service.listForDossier(id, currentUser(req).id)
  }

  @Delete('dossiers/:id/shares/:linkId')
  revoke(
    @Req() req: Request,
    @Param('id') id: string,
    @Param('linkId') linkId: string,
  ): Promise<ShareLink> {
    return this.service.revoke(id, linkId, currentUser(req).id)
  }
}
