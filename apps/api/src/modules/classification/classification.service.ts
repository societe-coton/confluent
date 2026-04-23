import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

const SECTOR_LABEL = "Secteur d'activité"
const MATURITY_LABEL = 'Stade de maturité'

export interface ClassificationResult {
  sector: string | null
  maturityStage: string | null
}

@Injectable()
export class ClassificationService {
  private readonly logger = new Logger(ClassificationService.name)

  constructor(private readonly prisma: PrismaService) {}

  async classify(dossierId: string): Promise<ClassificationResult> {
    const dossier = await this.prisma.dossier.findUnique({
      where: { id: dossierId },
      include: {
        questionnaireVersion: { include: { fields: true } },
        answers: true,
      },
    })
    if (!dossier) {
      this.logger.warn(`classify: dossier ${dossierId} not found`)
      return { sector: null, maturityStage: null }
    }
    const fields = dossier.questionnaireVersion.fields
    const sectorFieldId = fields.find((f) => f.label === SECTOR_LABEL)?.id
    const maturityFieldId = fields.find((f) => f.label === MATURITY_LABEL)?.id

    const sector = sectorFieldId
      ? (dossier.answers.find((a) => a.fieldId === sectorFieldId)?.value ?? null)
      : null
    const maturityStage = maturityFieldId
      ? (dossier.answers.find((a) => a.fieldId === maturityFieldId)?.value ?? null)
      : null

    await this.prisma.dossier.update({
      where: { id: dossierId },
      data: { sector, maturityStage },
    })
    return { sector, maturityStage }
  }
}
