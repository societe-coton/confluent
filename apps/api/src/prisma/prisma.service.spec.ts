import { PrismaClient } from '@prisma/client'
import { PrismaService } from './prisma.service'

describe('PrismaService', () => {
  it('extends PrismaClient', () => {
    const service = new PrismaService()
    expect(service).toBeInstanceOf(PrismaClient)
  })

  it('declares the OnModuleInit and OnModuleDestroy lifecycle hooks', () => {
    const service = new PrismaService()
    expect(typeof service.onModuleInit).toBe('function')
    expect(typeof service.onModuleDestroy).toBe('function')
  })
})
