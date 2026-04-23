import { Injectable } from '@nestjs/common'
import type { QuestionnaireField, QuestionnaireVersion } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import { QUESTIONNAIRE_V1_FIELDS } from './questionnaire.seed'

export interface ActiveQuestionnaire {
  version: QuestionnaireVersion
  fields: QuestionnaireField[]
}

@Injectable()
export class QuestionnairesService {
  constructor(private readonly prisma: PrismaService) {}

  async getActive(): Promise<ActiveQuestionnaire> {
    let version = await this.prisma.questionnaireVersion.findFirst({
      where: { isPublished: true },
      orderBy: { version: 'desc' },
    })
    if (!version) {
      version = await this.seedVersion1()
    }
    const fields = await this.prisma.questionnaireField.findMany({
      where: { versionId: version.id },
      orderBy: [{ section: 'asc' }, { orderIndex: 'asc' }],
    })
    return { version, fields }
  }

  async ensureBootstrap(): Promise<QuestionnaireVersion> {
    const existing = await this.prisma.questionnaireVersion.findFirst({
      where: { isPublished: true },
      orderBy: { version: 'desc' },
    })
    return existing ?? (await this.seedVersion1())
  }

  async getVersion(id: string): Promise<ActiveQuestionnaire | null> {
    const version = await this.prisma.questionnaireVersion.findUnique({ where: { id } })
    if (!version) return null
    const fields = await this.prisma.questionnaireField.findMany({
      where: { versionId: version.id },
      orderBy: [{ section: 'asc' }, { orderIndex: 'asc' }],
    })
    return { version, fields }
  }

  private async seedVersion1(): Promise<QuestionnaireVersion> {
    const version = await this.prisma.questionnaireVersion.create({
      data: {
        version: 1,
        isPublished: true,
        fields: { create: QUESTIONNAIRE_V1_FIELDS },
      },
    })
    return version
  }
}
