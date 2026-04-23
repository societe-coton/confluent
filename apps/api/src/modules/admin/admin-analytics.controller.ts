import { Controller, Get, UseGuards } from '@nestjs/common'
import { AdminGuard } from '../auth/guards/admin.guard'
import { AdminAnalyticsService, type PlatformAnalytics } from './admin-analytics.service'

@UseGuards(AdminGuard)
@Controller('admin/analytics')
export class AdminAnalyticsController {
  constructor(private readonly service: AdminAnalyticsService) {}

  @Get()
  platform(): Promise<PlatformAnalytics> {
    return this.service.platform()
  }
}
