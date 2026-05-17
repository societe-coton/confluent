import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

// V1 labels
const SECTOR_LABEL = "Secteur d'activité"
const MATURITY_LABEL = 'Stade de maturité'

// V2 labels
const LABELS = {
  ancrage: 'Votre lien avec la région Centre Val de Loire',
  secteur: 'Secteur principal',
  structure: 'Avez-vous une structure juridique créée ?',
  financement: 'Stade de financement actuel',
  origine: 'Origine du projet',
  techno: 'Votre projet repose-t-il sur une technologie difficile à reproduire ?',
  brevets: 'Avez-vous des brevets ?',
  verrou: 'Y a-t-il un verrou scientifique non résolu ?',
  rdPublic: 'Financement R&D public (ANR, BPI, Horizon) ?',
  stade: 'Stade du projet',
} as const

function answerFor(label: string, answers: Array<{ value: string; fieldId: string }>, fieldMap: Map<string, string>): string | null {
  const fieldId = fieldMap.get(label)
  if (!fieldId) return null
  return answers.find((a) => a.fieldId === fieldId)?.value ?? null
}

function computeAncrage(val: string | null): string | null {
  if (!val) return null
  if (val.startsWith('Mon projet est basé')) return 'ancré'
  if (val.startsWith('Je cherche à')) return 'en_cours'
  if (val.startsWith('Je découvre')) return 'découverte'
  return null
}

function computeAxe2(val: string | null): number | null {
  if (!val) return null
  if (val.startsWith('Fonds propres')) return 2
  if (val.startsWith('Love money')) return 3
  if (val.startsWith('Seed')) return 4
  if (val.startsWith('Pré-Série A')) return 5
  return null
}

function computeAxe3(val: string | null): number | null {
  if (!val) return null
  if (val.startsWith('Projet créé ex nihilo')) return 1
  if (val.startsWith('Spin-off d\'une entreprise')) return 2
  if (val.startsWith('Spin-off d\'un laboratoire')) return 3
  if (val.startsWith('Reprise d\'entreprise')) return 4
  if (val.startsWith('Pivot')) return 5
  return null
}

function computeAxe1(val: string | null): number | null {
  if (!val) return null
  if (val === 'Idée') return 1
  if (val === 'Concept validé') return 2
  if (val === 'MVP') return 3
  if (val === 'Premiers clients') return 4
  if (val === 'Croissance') return 5
  if (val.startsWith('TRL 1-3')) return 1
  if (val.startsWith('TRL 4-6')) return 3
  if (val.startsWith('TRL 7-9')) return 5
  return null
}

export interface ClassificationResult {
  sector: string | null
  maturityStage: string | null
  ancrageCvl: string | null
  tagTechnologique: string | null
  axe1Projet: number | null
  axe2Financier: number | null
  axe3Origine: number | null
  deeptechScore: number | null
  preCreation: boolean | null
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
      return {
        sector: null, maturityStage: null, ancrageCvl: null,
        tagTechnologique: null, axe1Projet: null, axe2Financier: null,
        axe3Origine: null, deeptechScore: null, preCreation: null,
      }
    }

    const fields = dossier.questionnaireVersion.fields
    // Build label → fieldId map for quick lookup
    const fieldMap = new Map<string, string>(fields.map((f) => [f.label, f.id]))
    const answers = dossier.answers

    // ── V1 fallback ──────────────────────────────────────────────────────────
    const sectorFieldId = fieldMap.get(SECTOR_LABEL)
    const maturityFieldId = fieldMap.get(MATURITY_LABEL)
    const sectorV1 = sectorFieldId ? (answers.find((a) => a.fieldId === sectorFieldId)?.value ?? null) : null
    const maturityV1 = maturityFieldId ? (answers.find((a) => a.fieldId === maturityFieldId)?.value ?? null) : null

    // ── V2 tags ───────────────────────────────────────────────────────────────
    const get = (label: string) => answerFor(label, answers, fieldMap)

    const secteurV2 = get(LABELS.secteur)
    const stadeV2 = get(LABELS.stade)

    const sector = secteurV2 ?? sectorV1
    const maturityStage = stadeV2 ?? maturityV1

    const ancrageCvl = computeAncrage(get(LABELS.ancrage))

    const structureVal = get(LABELS.structure)
    const preCreation = structureVal != null
      ? structureVal === 'Non' || structureVal === 'En cours de création'
      : null

    const axe2Financier = computeAxe2(get(LABELS.financement))
    const origineVal = get(LABELS.origine)
    const axe3Origine = computeAxe3(origineVal)
    const axe1Projet = computeAxe1(stadeV2)

    // deeptech score
    const technoVal = get(LABELS.techno)
    let tagTechnologique: string | null = null
    let deeptechScore: number | null = null

    if (technoVal != null) {
      if (technoVal.startsWith('Non')) {
        tagTechnologique = 'non_tech'
        deeptechScore = 0
      } else {
        let score = 0
        if (origineVal?.startsWith('Spin-off d\'un laboratoire')) score++
        const brevetsVal = get(LABELS.brevets)
        if (brevetsVal === 'Oui déposés' || brevetsVal === 'En cours') score++
        const verrouVal = get(LABELS.verrou)
        if (verrouVal === 'Oui') score++
        const rdVal = get(LABELS.rdPublic)
        if (rdVal === 'Oui' || rdVal === 'En cours') score++
        deeptechScore = score
        tagTechnologique = score >= 2 ? 'deeptech' : 'tech'
      }
    }

    const result: ClassificationResult = {
      sector,
      maturityStage,
      ancrageCvl,
      tagTechnologique,
      axe1Projet,
      axe2Financier,
      axe3Origine,
      deeptechScore,
      preCreation,
    }

    await this.prisma.dossier.update({
      where: { id: dossierId },
      data: result,
    })

    return result
  }
}
