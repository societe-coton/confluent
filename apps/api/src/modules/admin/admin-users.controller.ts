import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common'
import type { Request } from 'express'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { AdminGuard } from '../auth/guards/admin.guard'
import { AdminUsersService } from './admin-users.service'
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy'

const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  role: z.enum(['entrepreneur', 'financeur', 'admin']),
})
class InviteDto extends createZodDto(inviteSchema) {}

function currentUser(req: Request): AuthenticatedUser {
  return (req as Request & { user: AuthenticatedUser }).user
}

@UseGuards(AdminGuard)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly service: AdminUsersService) {}

  @Get()
  list() {
    return this.service.listUsers()
  }

  @Post('invite')
  invite(@Req() req: Request, @Body() body: InviteDto) {
    return this.service.invite({ email: body.email, role: body.role }, currentUser(req).id)
  }

  @Patch(':id/deactivate')
  deactivate(@Req() req: Request, @Param('id') id: string) {
    return this.service.deactivate(id, currentUser(req).id)
  }

  @Patch(':id/reactivate')
  reactivate(@Req() req: Request, @Param('id') id: string) {
    return this.service.reactivate(id, currentUser(req).id)
  }
}
