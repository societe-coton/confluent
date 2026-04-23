import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import type { App } from 'supertest/types'
import { AppModule } from './../src/app.module'
import { PrismaService } from './../src/prisma/prisma.service'
import { EMAIL_TRANSPORT } from './../src/modules/auth/email/email-transport'

describe('AppController (e2e)', () => {
  let app: INestApplication<App>

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        onModuleInit: async () => {},
        onModuleDestroy: async () => {},
        user: { findUnique: jest.fn() },
        magicLinkToken: { create: jest.fn() },
      })
      .overrideProvider(EMAIL_TRANSPORT)
      .useValue({ sendMail: jest.fn() })
      .compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  it('/ (GET) returns a JSON health response', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect({ status: 'ok', service: 'confluent-api', version: '0.0.1' })
  })

  afterEach(async () => {
    await app.close()
  })
})
