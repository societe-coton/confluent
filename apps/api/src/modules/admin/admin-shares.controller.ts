import { Controller, Delete, Param, Req, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import type { Request } from 'express'
import { AdminGuard } from '../auth/guards/admin.guard'
import { AdminSharesService } from './admin-shares.service'
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy'

function currentUser(req: Request): AuthenticatedUser {
  return (req as Request & { user: AuthenticatedUser }).user
}

@ApiTags('Admin · Partages')
@ApiBearerAuth('jwt')
@ApiUnauthorizedResponse({ description: 'JWT manquant.' })
@ApiForbiddenResponse({ description: 'JWT sans rôle `admin`.' })
@UseGuards(AdminGuard)
@Controller('admin/dossiers/:dossierId/shares')
export class AdminSharesController {
  constructor(private readonly service: AdminSharesService) {}

  @Delete(':linkId')
  @ApiOperation({
    summary: 'Révocation admin transversale d’un partage (FR22)',
    description:
      'Équivalent admin de `DELETE /v1/dossiers/:id/shares/:linkId` — l’admin peut révoquer un partage ' +
      'sur **n’importe quel dossier** de la plateforme, sans ownership requis. Audit : `admin_revoked_share_link` ' +
      'avec `actorId` (admin) + `recipientEmail` + `revokedAt`. Effet immédiat côté financeur.',
  })
  @ApiParam({ name: 'dossierId', description: 'UUID du dossier' })
  @ApiParam({ name: 'linkId', description: 'UUID du share link' })
  @ApiOkResponse({ description: 'Partage révoqué.' })
  @ApiNotFoundResponse({
    description: 'Share link inexistant ou n’appartenant pas au dossier ciblé.',
  })
  revoke(
    @Req() req: Request,
    @Param('dossierId') dossierId: string,
    @Param('linkId') linkId: string,
  ) {
    return this.service.revoke(dossierId, linkId, currentUser(req).id)
  }
}
