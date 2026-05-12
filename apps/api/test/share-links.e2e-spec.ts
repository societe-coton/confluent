import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import type { App } from 'supertest/types'
import cookieParser from 'cookie-parser'
import { AppModule } from './../src/app.module'
import { PrismaService } from './../src/prisma/prisma.service'
import { EMAIL_TRANSPORT } from './../src/modules/auth/email/email-transport'
import { AuditService } from './../src/modules/audit/audit.service'
import { ZodValidationPipe } from 'nestjs-zod'
import { GlobalExceptionFilter } from './../src/common/filters/global-exception.filter'

describe('ShareLinksController (e2e)', () => {
  let app: INestApplication<App>
  let shareFindUnique: jest.Mock
  let dossierFindUnique: jest.Mock
  let auditRecord: jest.Mock

  beforeEach(async () => {
    shareFindUnique = jest.fn()
    dossierFindUnique = jest.fn()
    auditRecord = jest.fn().mockResolvedValue(undefined)
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        onModuleInit: async () => {},
        onModuleDestroy: async () => {},
        user: { findUnique: jest.fn() },
        magicLinkToken: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
        shareLink: { findUnique: shareFindUnique },
        dossier: { findUnique: dossierFindUnique },
        auditLog: { create: jest.fn() },
      })
      .overrideProvider(EMAIL_TRANSPORT)
      .useValue({ sendMagicLink: jest.fn(), sendShareInvite: jest.fn() })
      .overrideProvider(AuditService)
      .useValue({ record: auditRecord })
      .compile()

    app = moduleFixture.createNestApplication()
    app.use(cookieParser())
    app.setGlobalPrefix('v1', { exclude: ['/'] })
    app.useGlobalPipes(new ZodValidationPipe())
    app.useGlobalFilters(new GlobalExceptionFilter())
    await app.init()
  })

  afterEach(async () => {
    await app.close()
  })

  it('GET /v1/shares/:token — active: 200, scoped payload + audit written', async () => {
    shareFindUnique.mockResolvedValue({
      id: 'sl-1',
      token: 'abc',
      status: 'active',
      dossierId: 'd-1',
      recipientEmail: 'bob@invest.fr',
    })
    dossierFindUnique.mockResolvedValue({ id: 'd-1', name: 'Biosensio', slug: 'biosensio' })

    const res = await request(app.getHttpServer()).get('/v1/shares/abc').expect(200)

    expect(res.body).toEqual({
      dossier: { id: 'd-1', name: 'Biosensio', slug: 'biosensio' },
      share: { recipientEmail: 'bob@invest.fr', status: 'active' },
    })
    expect(auditRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        actionType: 'share_link_viewed',
        shareLinkId: 'sl-1',
        dossierId: 'd-1',
      }),
    )
  })

  it('GET /v1/shares/:token — unknown token: 403 + deny audit', async () => {
    shareFindUnique.mockResolvedValue(null)
    const res = await request(app.getHttpServer()).get('/v1/shares/unknown').expect(403)
    expect(res.body.error.code).toBe('FORBIDDEN')
    expect(auditRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        actionType: 'share_link_access_denied',
        metadata: expect.objectContaining({ reason: 'not_found' }),
      }),
    )
  })

  it('GET /v1/shares/:token — revoked: 403 + deny audit', async () => {
    shareFindUnique.mockResolvedValue({
      id: 'sl-2',
      token: 'rev',
      status: 'revoked',
      dossierId: 'd-1',
      recipientEmail: 'bob@invest.fr',
    })
    await request(app.getHttpServer()).get('/v1/shares/rev').expect(403)
    expect(auditRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        actionType: 'share_link_access_denied',
        metadata: expect.objectContaining({ reason: 'revoked' }),
      }),
    )
  })
})
