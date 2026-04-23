import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import type { Request } from 'express'
import { Public } from '../../common/decorators/public.decorator'
import { ShareLinkGuard, type AugmentedRequest } from '../auth/guards/share-link.guard'
import { ShareLinksService, type FinanceurShareResponse } from './share-links.service'

@Controller('shares')
export class ShareLinksController {
  constructor(private readonly service: ShareLinksService) {}

  @Public()
  @UseGuards(ShareLinkGuard)
  @Get(':token')
  async getShare(@Req() req: Request): Promise<FinanceurShareResponse> {
    const aug = req as AugmentedRequest
    const shareLink = aug.shareLink!
    await this.service.recordView(shareLink, req)
    return this.service.resolveForFinanceur(shareLink)
  }
}
