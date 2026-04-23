import { Test } from '@nestjs/testing'
import { AnswersService } from './answers.service'
import { PrismaService } from '../../prisma/prisma.service'

describe('AnswersService', () => {
  it('lists answers scoped to the dossier', async () => {
    const findMany = jest.fn().mockResolvedValue([])
    const moduleRef = await Test.createTestingModule({
      providers: [
        AnswersService,
        {
          provide: PrismaService,
          useValue: { dossierAnswer: { findMany } },
        },
      ],
    }).compile()
    const svc = moduleRef.get(AnswersService)

    await svc.listForDossier('d-1')
    expect(findMany).toHaveBeenCalledWith({
      where: { dossierId: 'd-1' },
      orderBy: { createdAt: 'asc' },
    })
  })

  it('upserts each answer idempotently inside a transaction', async () => {
    const upsert = jest.fn((args: unknown) => ({ kind: 'op', args }))
    const transaction = jest.fn().mockResolvedValue([{ id: 'a-1' }, { id: 'a-2' }])
    const moduleRef = await Test.createTestingModule({
      providers: [
        AnswersService,
        {
          provide: PrismaService,
          useValue: { dossierAnswer: { upsert }, $transaction: transaction },
        },
      ],
    }).compile()
    const svc = moduleRef.get(AnswersService)

    const result = await svc.upsertMany('d-1', [
      { fieldId: 'f-1', value: 'hello' },
      { fieldId: 'f-2', value: 'world' },
    ])
    expect(upsert).toHaveBeenCalledTimes(2)
    expect(upsert).toHaveBeenNthCalledWith(1, {
      where: { dossierId_fieldId: { dossierId: 'd-1', fieldId: 'f-1' } },
      create: { dossierId: 'd-1', fieldId: 'f-1', value: 'hello' },
      update: { value: 'hello' },
    })
    expect(transaction).toHaveBeenCalledTimes(1)
    expect(result).toHaveLength(2)
  })
})
