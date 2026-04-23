import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Req } from '@nestjs/common'
import type { Request } from 'express'
import type { Dossier } from '@prisma/client'
import { createDossierSchema, updateDossierSchema } from '@confluent/shared'
import { createZodDto } from 'nestjs-zod'
import { DossiersService } from './dossiers.service'
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy'

class CreateDossierDto extends createZodDto(createDossierSchema) {}
class UpdateDossierDto extends createZodDto(updateDossierSchema) {}

function currentUser(req: Request): AuthenticatedUser {
  return (req as Request & { user: AuthenticatedUser }).user
}

@Controller('dossiers')
export class DossiersController {
  constructor(private readonly service: DossiersService) {}

  @Post()
  @HttpCode(201)
  create(@Req() req: Request, @Body() body: CreateDossierDto): Promise<Dossier> {
    return this.service.create({ userId: currentUser(req).id, name: body.name })
  }

  @Get()
  list(@Req() req: Request): Promise<Dossier[]> {
    return this.service.listForUser(currentUser(req).id)
  }

  @Get(':id')
  getOne(@Req() req: Request, @Param('id') id: string): Promise<Dossier> {
    return this.service.getByIdForUser(id, currentUser(req).id)
  }

  @Patch(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: UpdateDossierDto,
  ): Promise<Dossier> {
    return this.service.update({ userId: currentUser(req).id, id, name: body.name })
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Req() req: Request, @Param('id') id: string): Promise<void> {
    await this.service.delete(id, currentUser(req).id)
  }
}
