import { Controller, Get, Param, Req } from '@nestjs/common'
import type { Request } from 'express'
import { AnalyticsService, type DossierAnalytics } from './analytics.service'
import { DossiersService } from '../dossiers/dossiers.service'
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy'

function currentUser(req: Request): AuthenticatedUser {
  return (req as Request & { user: AuthenticatedUser }).user
}

@Controller('dossiers/:dossierId/analytics')
export class AnalyticsController {
  constructor(
    private readonly analytics: AnalyticsService,
    private readonly dossiers: DossiersService,
  ) {}

  @Get()
  async forDossier(
    @Req() req: Request,
    @Param('dossierId') dossierId: string,
  ): Promise<DossierAnalytics> {
    await this.dossiers.getByIdForUser(dossierId, currentUser(req).id)
    return this.analytics.forDossier(dossierId)
  }
}
