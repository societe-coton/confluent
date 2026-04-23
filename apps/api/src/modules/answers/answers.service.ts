import { Injectable } from '@nestjs/common'
import type { DossierAnswer } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'

export interface AnswerInput {
  fieldId: string
  value: string
}

@Injectable()
export class AnswersService {
  constructor(private readonly prisma: PrismaService) {}

  listForDossier(dossierId: string): Promise<DossierAnswer[]> {
    return this.prisma.dossierAnswer.findMany({
      where: { dossierId },
      orderBy: { createdAt: 'asc' },
    })
  }

  async upsertMany(dossierId: string, answers: AnswerInput[]): Promise<DossierAnswer[]> {
    const ops = answers.map((a) =>
      this.prisma.dossierAnswer.upsert({
        where: { dossierId_fieldId: { dossierId, fieldId: a.fieldId } },
        create: { dossierId, fieldId: a.fieldId, value: a.value },
        update: { value: a.value },
      }),
    )
    return this.prisma.$transaction(ops)
  }
}
