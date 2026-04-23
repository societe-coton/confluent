import { Body, Controller, Get, Param, Put, Req } from '@nestjs/common'
import type { Request } from 'express'
import type { DossierAnswer } from '@prisma/client'
import { upsertAnswersSchema } from '@confluent/shared'
import { createZodDto } from 'nestjs-zod'
import { AnswersService } from './answers.service'
import { DossiersService } from '../dossiers/dossiers.service'
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy'

class UpsertAnswersDto extends createZodDto(upsertAnswersSchema) {}

function currentUser(req: Request): AuthenticatedUser {
  return (req as Request & { user: AuthenticatedUser }).user
}

@Controller('dossiers/:dossierId/answers')
export class AnswersController {
  constructor(
    private readonly answers: AnswersService,
    private readonly dossiers: DossiersService,
  ) {}

  @Get()
  async list(@Req() req: Request, @Param('dossierId') dossierId: string): Promise<DossierAnswer[]> {
    await this.dossiers.getByIdForUser(dossierId, currentUser(req).id)
    return this.answers.listForDossier(dossierId)
  }

  @Put()
  async upsert(
    @Req() req: Request,
    @Param('dossierId') dossierId: string,
    @Body() body: UpsertAnswersDto,
  ): Promise<DossierAnswer[]> {
    await this.dossiers.getByIdForUser(dossierId, currentUser(req).id)
    return this.answers.upsertMany(dossierId, body.answers)
  }
}
