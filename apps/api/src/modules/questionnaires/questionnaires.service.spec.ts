import { Test } from '@nestjs/testing'
import { QuestionnairesService } from './questionnaires.service'
import { PrismaService } from '../../prisma/prisma.service'

function buildPrisma(
  overrides: {
    findFirst?: jest.Mock
    findMany?: jest.Mock
    create?: jest.Mock
    findUnique?: jest.Mock
  } = {},
) {
  return {
    questionnaireVersion: {
      findFirst: overrides.findFirst ?? jest.fn().mockResolvedValue(null),
      findUnique: overrides.findUnique ?? jest.fn(),
      create: overrides.create ?? jest.fn(),
    },
    questionnaireField: {
      findMany: overrides.findMany ?? jest.fn().mockResolvedValue([]),
    },
  }
}

async function instantiate(prisma: ReturnType<typeof buildPrisma>) {
  const moduleRef = await Test.createTestingModule({
    providers: [QuestionnairesService, { provide: PrismaService, useValue: prisma }],
  }).compile()
  return moduleRef.get(QuestionnairesService)
}

describe('QuestionnairesService.getActive', () => {
  it('seeds version 1 when no version exists', async () => {
    const prisma = buildPrisma({
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'qv-1', version: 1, isPublished: true }),
      findMany: jest.fn().mockResolvedValue([]),
    })
    const svc = await instantiate(prisma)

    const result = await svc.getActive()
    expect(prisma.questionnaireVersion.create).toHaveBeenCalledTimes(1)
    expect(result.version.id).toBe('qv-1')
  })

  it('returns the latest published version without reseeding', async () => {
    const prisma = buildPrisma({
      findFirst: jest.fn().mockResolvedValue({ id: 'qv-2', version: 2, isPublished: true }),
      findMany: jest.fn().mockResolvedValue([{ id: 'f-1' }]),
    })
    const svc = await instantiate(prisma)

    const result = await svc.getActive()
    expect(prisma.questionnaireVersion.create).not.toHaveBeenCalled()
    expect(result.fields).toHaveLength(1)
  })
})
