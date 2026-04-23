import { Injectable, NotFoundException } from '@nestjs/common'
import type { Dossier } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import { slugify } from '../../common/slug'
import { QuestionnairesService } from '../questionnaires/questionnaires.service'
import { ClassificationService } from '../classification/classification.service'

export interface CreateDossierParams {
  userId: string
  name: string
}

export interface UpdateDossierParams {
  userId: string
  id: string
  name?: string
}

@Injectable()
export class DossiersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly questionnaires: QuestionnairesService,
    private readonly classification: ClassificationService,
  ) {}

  async create(params: CreateDossierParams): Promise<Dossier> {
    const baseSlug = slugify(params.name)
    const slug = await this.uniqueSlug(baseSlug)
    const version = await this.questionnaires.ensureBootstrap()
    return this.prisma.dossier.create({
      data: {
        userId: params.userId,
        name: params.name,
        slug,
        questionnaireVersionId: version.id,
      },
    })
  }

  listForUser(userId: string): Promise<Dossier[]> {
    return this.prisma.dossier.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getByIdForUser(id: string, userId: string): Promise<Dossier> {
    const dossier = await this.prisma.dossier.findUnique({ where: { id } })
    if (!dossier || dossier.userId !== userId) {
      throw new NotFoundException({ code: 'DOSSIER_NOT_FOUND', message: 'Dossier not found.' })
    }
    return dossier
  }

  async getWithQuestionnaire(id: string, userId: string) {
    const dossier = await this.getByIdForUser(id, userId)
    const snapshot = await this.questionnaires.getVersion(dossier.questionnaireVersionId)
    return { ...dossier, questionnaireVersion: snapshot }
  }

  async update(params: UpdateDossierParams): Promise<Dossier> {
    const dossier = await this.getByIdForUser(params.id, params.userId)
    const data: { name?: string; slug?: string } = {}
    if (params.name !== undefined) {
      data.name = params.name
      data.slug = await this.uniqueSlug(slugify(params.name), dossier.id)
    }
    return this.prisma.dossier.update({ where: { id: dossier.id }, data })
  }

  async delete(id: string, userId: string): Promise<void> {
    const dossier = await this.getByIdForUser(id, userId)
    await this.prisma.dossier.delete({ where: { id: dossier.id } })
  }

  async submit(id: string, userId: string): Promise<Dossier> {
    const dossier = await this.getByIdForUser(id, userId)
    await this.classification.classify(dossier.id)
    return this.prisma.dossier.update({
      where: { id: dossier.id },
      data: { submittedAt: new Date() },
    })
  }

  private async uniqueSlug(base: string, ignoreDossierId?: string): Promise<string> {
    const existing = await this.prisma.dossier.findMany({
      where: { slug: { startsWith: base } },
      select: { id: true, slug: true },
    })
    const taken = new Set(existing.filter((d) => d.id !== ignoreDossierId).map((d) => d.slug))
    if (!taken.has(base)) return base
    let n = 2
    while (taken.has(`${base}-${n}`)) n += 1
    return `${base}-${n}`
  }
}
