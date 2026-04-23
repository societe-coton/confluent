import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common'
import type { Request } from 'express'
import type { AuditLog } from '@prisma/client'
import { AuditLogService } from './audit-log.service'
import { DossiersService } from '../dossiers/dossiers.service'
import { AdminGuard } from '../auth/guards/admin.guard'
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy'

function currentUser(req: Request): AuthenticatedUser {
  return (req as Request & { user: AuthenticatedUser }).user
}

@Controller()
export class AuditLogController {
  constructor(
    private readonly service: AuditLogService,
    private readonly dossiers: DossiersService,
  ) {}

  @Get('dossiers/:id/audit-log')
  async forEntrepreneur(@Req() req: Request, @Param('id') id: string): Promise<AuditLog[]> {
    await this.dossiers.getByIdForUser(id, currentUser(req).id)
    return this.service.listForEntrepreneur(id)
  }

  @UseGuards(AdminGuard)
  @Get('admin/dossiers/:id/audit-log')
  forAdmin(@Param('id') id: string): Promise<AuditLog[]> {
    return this.service.listForAdmin(id)
  }
}
