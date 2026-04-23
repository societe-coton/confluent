import { Module } from '@nestjs/common'
import { ShareLinksController } from './share-links.controller'
import { ShareLinksService } from './share-links.service'
import { ShareLinkGuard } from '../auth/guards/share-link.guard'

@Module({
  controllers: [ShareLinksController],
  providers: [ShareLinksService, ShareLinkGuard],
  exports: [ShareLinksService],
})
export class ShareLinksModule {}
