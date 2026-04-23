import { Controller, Delete, Param, Req, UseGuards } from '@nestjs/common'
import type { Request } from 'express'
import { AdminGuard } from '../auth/guards/admin.guard'
import { AdminSharesService } from './admin-shares.service'
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy'

function currentUser(req: Request): AuthenticatedUser {
  return (req as Request & { user: AuthenticatedUser }).user
}

@UseGuards(AdminGuard)
@Controller('admin/dossiers/:dossierId/shares')
export class AdminSharesController {
  constructor(private readonly service: AdminSharesService) {}

  @Delete(':linkId')
  revoke(
    @Req() req: Request,
    @Param('dossierId') dossierId: string,
    @Param('linkId') linkId: string,
  ) {
    return this.service.revoke(dossierId, linkId, currentUser(req).id)
  }
}
