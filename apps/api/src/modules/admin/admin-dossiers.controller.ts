import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import type { Request } from 'express'
import { createZodDto } from 'nestjs-zod'
import { upsertAnswersSchema } from '@confluent/shared'
import { AdminGuard } from '../auth/guards/admin.guard'
import { AdminDossiersService } from './admin-dossiers.service'
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy'

class UpsertAnswersDto extends createZodDto(upsertAnswersSchema) {}

function currentUser(req: Request): AuthenticatedUser {
  return (req as Request & { user: AuthenticatedUser }).user
}

@UseGuards(AdminGuard)
@Controller('admin/dossiers')
export class AdminDossiersController {
  constructor(private readonly service: AdminDossiersService) {}

  @Get()
  list(@Query('page') pageQ?: string, @Query('pageSize') pageSizeQ?: string) {
    const page = Math.max(1, Number(pageQ) || 1)
    const pageSize = Math.min(100, Math.max(1, Number(pageSizeQ) || 20))
    return this.service.list(page, pageSize)
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.service.detail(id)
  }

  @Patch(':id/answers')
  @HttpCode(200)
  async editAnswers(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: UpsertAnswersDto,
  ): Promise<{ status: 'ok' }> {
    await this.service.editAnswers(id, currentUser(req).id, body.answers)
    return { status: 'ok' }
  }
}
