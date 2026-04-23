import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import type { Request } from 'express'
import { DocumentsService, type DocumentGroup } from './documents.service'
import { DossiersService } from '../dossiers/dossiers.service'
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy'

interface MulterFile {
  originalname: string
  mimetype: string
  buffer: Buffer
  size: number
}

function currentUser(req: Request): AuthenticatedUser {
  return (req as Request & { user: AuthenticatedUser }).user
}

@Controller('dossiers/:dossierId/documents')
export class DocumentsController {
  constructor(
    private readonly documents: DocumentsService,
    private readonly dossiers: DossiersService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Req() req: Request,
    @Param('dossierId') dossierId: string,
    @UploadedFile() file: MulterFile | undefined,
  ) {
    if (!file) {
      throw new BadRequestException({ code: 'FILE_REQUIRED', message: 'File is required.' })
    }
    await this.dossiers.getByIdForUser(dossierId, currentUser(req).id)
    const created = await this.documents.upload({
      dossierId,
      filename: file.originalname,
      mimetype: file.mimetype,
      buffer: file.buffer,
    })
    return {
      id: created.id,
      filename: created.filename,
      version: created.version,
      mimetype: created.mimetype,
      size: created.size,
      createdAt: created.createdAt,
    }
  }

  @Get()
  async list(@Req() req: Request, @Param('dossierId') dossierId: string): Promise<DocumentGroup[]> {
    await this.dossiers.getByIdForUser(dossierId, currentUser(req).id)
    return this.documents.listForDossier(dossierId)
  }
}
