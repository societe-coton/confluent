import { Test } from '@nestjs/testing'
import { ClassificationService } from './classification.service'
import { PrismaService } from '../../prisma/prisma.service'

function buildPrisma(dossier: unknown) {
  const update = jest
    .fn()
    .mockImplementation(async (args: { data: Record<string, unknown> }) =>
      Promise.resolve({ id: 'd-1', ...args.data }),
    )
  return {
    prisma: {
      dossier: {
        findUnique: jest.fn().mockResolvedValue(dossier),
        update,
      },
    },
    update,
  }
}

async function instantiate(prisma: unknown) {
  const moduleRef = await Test.createTestingModule({
    providers: [ClassificationService, { provide: PrismaService, useValue: prisma }],
  }).compile()
  return moduleRef.get(ClassificationService)
}

describe('ClassificationService.classify', () => {
  it('maps sector + maturity answers to dossier columns', async () => {
    const { prisma, update } = buildPrisma({
      id: 'd-1',
      questionnaireVersion: {
        fields: [
          { id: 'f-sector', label: "Secteur d'activité" },
          { id: 'f-maturity', label: 'Stade de maturité' },
          { id: 'f-other', label: 'Autre' },
        ],
      },
      answers: [
        { fieldId: 'f-sector', value: 'Biotech' },
        { fieldId: 'f-maturity', value: 'Seed' },
        { fieldId: 'f-other', value: '...' },
      ],
    })
    const svc = await instantiate(prisma)
    const result = await svc.classify('d-1')
    expect(result).toEqual({ sector: 'Biotech', maturityStage: 'Seed' })
    expect(update).toHaveBeenCalledWith({
      where: { id: 'd-1' },
      data: { sector: 'Biotech', maturityStage: 'Seed' },
    })
  })

  it('writes null when answers are missing', async () => {
    const { prisma, update } = buildPrisma({
      id: 'd-1',
      questionnaireVersion: {
        fields: [
          { id: 'f-sector', label: "Secteur d'activité" },
          { id: 'f-maturity', label: 'Stade de maturité' },
        ],
      },
      answers: [],
    })
    const svc = await instantiate(prisma)
    const result = await svc.classify('d-1')
    expect(result).toEqual({ sector: null, maturityStage: null })
    expect(update).toHaveBeenCalledWith({
      where: { id: 'd-1' },
      data: { sector: null, maturityStage: null },
    })
  })

  it('returns nulls if the dossier does not exist (and does not update)', async () => {
    const { prisma, update } = buildPrisma(null)
    const svc = await instantiate(prisma)
    const result = await svc.classify('nope')
    expect(result).toEqual({ sector: null, maturityStage: null })
    expect(update).not.toHaveBeenCalled()
  })
})
