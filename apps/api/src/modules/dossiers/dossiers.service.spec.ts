import { Test } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { DossiersService } from './dossiers.service'
import { PrismaService } from '../../prisma/prisma.service'

interface PrismaMock {
  dossier: {
    create: jest.Mock
    findMany: jest.Mock
    findUnique: jest.Mock
    update: jest.Mock
    delete: jest.Mock
  }
  questionnaireVersion: {
    findFirst: jest.Mock
    create: jest.Mock
  }
}

function buildPrisma(): PrismaMock {
  return {
    dossier: {
      create: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn().mockResolvedValue({}),
    },
    questionnaireVersion: {
      findFirst: jest.fn().mockResolvedValue({ id: 'qv-1', version: 1 }),
      create: jest.fn().mockResolvedValue({ id: 'qv-1', version: 1 }),
    },
  }
}

async function instantiate(prisma: PrismaMock): Promise<DossiersService> {
  const moduleRef = await Test.createTestingModule({
    providers: [DossiersService, { provide: PrismaService, useValue: prisma }],
  }).compile()
  return moduleRef.get(DossiersService)
}

describe('DossiersService', () => {
  it('creates a dossier with a slugified name and resolves a unique slug', async () => {
    const prisma = buildPrisma()
    prisma.dossier.findMany.mockResolvedValue([{ id: 'd-0', slug: 'biosensio' }])
    prisma.dossier.create.mockImplementation(async (args: { data: Record<string, unknown> }) =>
      Promise.resolve({ id: 'd-new', ...args.data }),
    )
    const svc = await instantiate(prisma)

    const result = await svc.create({ userId: 'u-1', name: 'Biosensio' })
    expect(prisma.dossier.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'u-1',
        name: 'Biosensio',
        slug: 'biosensio-2',
        questionnaireVersionId: 'qv-1',
      }),
    })
    expect(result.slug).toBe('biosensio-2')
  })

  it('creates the default questionnaire version if none exists', async () => {
    const prisma = buildPrisma()
    prisma.questionnaireVersion.findFirst.mockResolvedValue(null)
    prisma.questionnaireVersion.create.mockResolvedValue({ id: 'qv-bootstrap', version: 1 })
    prisma.dossier.create.mockImplementation(async (args: { data: Record<string, unknown> }) =>
      Promise.resolve({ id: 'd-new', ...args.data }),
    )
    const svc = await instantiate(prisma)

    await svc.create({ userId: 'u-1', name: 'Foo' })
    expect(prisma.questionnaireVersion.create).toHaveBeenCalled()
    expect(prisma.dossier.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ questionnaireVersionId: 'qv-bootstrap' }),
      }),
    )
  })

  it('scopes list to the authenticated user', async () => {
    const prisma = buildPrisma()
    prisma.dossier.findMany.mockResolvedValue([{ id: 'd-1' }])
    const svc = await instantiate(prisma)

    await svc.listForUser('u-1')
    expect(prisma.dossier.findMany).toHaveBeenCalledWith({
      where: { userId: 'u-1' },
      orderBy: { createdAt: 'desc' },
    })
  })

  it('returns 404 when the dossier belongs to another user', async () => {
    const prisma = buildPrisma()
    prisma.dossier.findUnique.mockResolvedValue({ id: 'd-x', userId: 'u-other' })
    const svc = await instantiate(prisma)
    await expect(svc.getByIdForUser('d-x', 'u-1')).rejects.toBeInstanceOf(NotFoundException)
  })

  it('returns 404 when the dossier does not exist', async () => {
    const prisma = buildPrisma()
    prisma.dossier.findUnique.mockResolvedValue(null)
    const svc = await instantiate(prisma)
    await expect(svc.getByIdForUser('nope', 'u-1')).rejects.toBeInstanceOf(NotFoundException)
  })

  it('updates name and regenerates slug', async () => {
    const prisma = buildPrisma()
    prisma.dossier.findUnique.mockResolvedValue({
      id: 'd-1',
      userId: 'u-1',
      name: 'Old',
      slug: 'old',
    })
    prisma.dossier.findMany.mockResolvedValue([])
    prisma.dossier.update.mockResolvedValue({
      id: 'd-1',
      userId: 'u-1',
      name: 'New Name',
      slug: 'new-name',
    })
    const svc = await instantiate(prisma)

    const result = await svc.update({ userId: 'u-1', id: 'd-1', name: 'New Name' })
    expect(result.slug).toBe('new-name')
    expect(prisma.dossier.update).toHaveBeenCalledWith({
      where: { id: 'd-1' },
      data: { name: 'New Name', slug: 'new-name' },
    })
  })

  it('deletes the dossier and relies on prisma cascade for children', async () => {
    const prisma = buildPrisma()
    prisma.dossier.findUnique.mockResolvedValue({ id: 'd-1', userId: 'u-1' })
    const svc = await instantiate(prisma)

    await svc.delete('d-1', 'u-1')
    expect(prisma.dossier.delete).toHaveBeenCalledWith({ where: { id: 'd-1' } })
  })
})
