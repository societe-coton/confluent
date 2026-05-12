import { Controller, Get, Param, Req } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import type { Request } from 'express'
import { AnalyticsService, type DossierAnalytics } from './analytics.service'
import { DossiersService } from '../dossiers/dossiers.service'
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy'

function currentUser(req: Request): AuthenticatedUser {
  return (req as Request & { user: AuthenticatedUser }).user
}

@ApiTags('Analytics')
@ApiBearerAuth('jwt')
@ApiParam({ name: 'dossierId', description: 'UUID du dossier' })
@ApiUnauthorizedResponse({ description: 'JWT manquant.' })
@ApiNotFoundResponse({ description: 'Dossier inexistant ou possédé par un autre user.' })
@Controller('dossiers/:dossierId/analytics')
export class AnalyticsController {
  constructor(
    private readonly analytics: AnalyticsService,
    private readonly dossiers: DossiersService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Analytics d’un dossier',
    description:
      'Agrégation de tous les `share_link_viewed` dans `audit_log` + état des share links. Retourne :\n' +
      '- `activeRecipients` — nombre de partages au statut `active`\n' +
      '- `totalViews` — nombre total de consultations\n' +
      '- `avgSessionDurationSeconds` — `null` en V1 (session-window heuristic deferred)\n' +
      '- `perRecipient[]` — par share link : `shareLinkId, recipientEmail, status, viewCount, lastViewedAt`\n\n' +
      'Les partages jamais consultés ont `viewCount: 0` et `lastViewedAt: null`.',
  })
  @ApiOkResponse({ description: 'Analytics agrégées du dossier.' })
  async forDossier(
    @Req() req: Request,
    @Param('dossierId') dossierId: string,
  ): Promise<DossierAnalytics> {
    await this.dossiers.getByIdForUser(dossierId, currentUser(req).id)
    return this.analytics.forDossier(dossierId)
  }
}
