import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import type { App } from 'supertest/types'
import cookieParser from 'cookie-parser'
import { AppModule } from './../src/app.module'
import { PrismaService } from './../src/prisma/prisma.service'
import { EMAIL_TRANSPORT } from './../src/modules/auth/email/email-transport'
import { ZodValidationPipe } from 'nestjs-zod'
import { GlobalExceptionFilter } from './../src/common/filters/global-exception.filter'
import { REFRESH_COOKIE_NAME } from './../src/modules/auth/auth.constants'

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>
  let sendMail: jest.Mock
  let findUnique: jest.Mock
  let tokenFindUnique: jest.Mock
  let tokenUpdate: jest.Mock
  let tokenCreate: jest.Mock

  beforeEach(async () => {
    sendMail = jest.fn().mockResolvedValue(undefined)
    findUnique = jest.fn()
    tokenFindUnique = jest.fn()
    tokenUpdate = jest.fn().mockResolvedValue({})
    tokenCreate = jest.fn().mockResolvedValue({})
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        onModuleInit: async () => {},
        onModuleDestroy: async () => {},
        user: { findUnique },
        magicLinkToken: {
          create: tokenCreate,
          findUnique: tokenFindUnique,
          update: tokenUpdate,
        },
      })
      .overrideProvider(EMAIL_TRANSPORT)
      .useValue({ sendMail })
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

  it('POST /v1/auth/magic-link — known user: 200 + email dispatched', async () => {
    findUnique.mockResolvedValue({ id: 'u1', email: 'sophie@biosensio.fr' })
    const res = await request(app.getHttpServer())
      .post('/v1/auth/magic-link')
      .send({ email: 'sophie@biosensio.fr' })
      .expect(200)
    expect(res.body).toEqual({ message: 'Magic link sent.' })
    expect(sendMail).toHaveBeenCalledTimes(1)
  })

  it('POST /v1/auth/magic-link — unknown user: 200 + no email', async () => {
    findUnique.mockResolvedValue(null)
    const res = await request(app.getHttpServer())
      .post('/v1/auth/magic-link')
      .send({ email: 'unknown@example.com' })
      .expect(200)
    expect(res.body).toEqual({ message: 'Magic link sent.' })
    expect(sendMail).not.toHaveBeenCalled()
  })

  it('POST /v1/auth/magic-link — invalid email body: 400 VALIDATION_ERROR', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/auth/magic-link')
      .send({ email: 'not-an-email' })
      .expect(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('GET /v1/auth/verify — valid token: 200 + access token + refresh cookie', async () => {
    tokenFindUnique.mockResolvedValue({
      id: 'mlt-1',
      expiresAt: new Date(Date.now() + 60_000),
      consumedAt: null,
      user: { id: 'u1', email: 'sophie@biosensio.fr', role: 'entrepreneur' },
    })
    const res = await request(app.getHttpServer())
      .get('/v1/auth/verify')
      .query({ token: '123e4567-e89b-42d3-a456-556642440000' })
      .expect(200)
    expect(res.body.accessToken).toBeDefined()
    expect(res.body.user).toEqual({
      id: 'u1',
      email: 'sophie@biosensio.fr',
      role: 'entrepreneur',
    })
    const setCookie = res.headers['set-cookie'] as unknown as string[] | undefined
    expect(setCookie?.some((c) => c.startsWith(`${REFRESH_COOKIE_NAME}=`))).toBe(true)
  })

  it('GET /v1/auth/verify — expired token: 401 INVALID_TOKEN', async () => {
    tokenFindUnique.mockResolvedValue({
      id: 'mlt-2',
      expiresAt: new Date(Date.now() - 60_000),
      consumedAt: null,
      user: { id: 'u1', email: 'sophie@biosensio.fr', role: 'entrepreneur' },
    })
    const res = await request(app.getHttpServer())
      .get('/v1/auth/verify')
      .query({ token: '123e4567-e89b-42d3-a456-556642440001' })
      .expect(401)
    expect(res.body.error.code).toBe('UNAUTHORIZED')
  })

  it('GET /v1/auth/verify — non-uuid token: 400 VALIDATION_ERROR', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/auth/verify')
      .query({ token: 'not-a-uuid' })
      .expect(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('POST /v1/auth/logout — clears the refresh cookie', async () => {
    const res = await request(app.getHttpServer()).post('/v1/auth/logout').expect(200)
    expect(res.body).toEqual({ message: 'Logged out.' })
    const setCookie = res.headers['set-cookie'] as unknown as string[] | undefined
    expect(setCookie?.some((c) => c.startsWith(`${REFRESH_COOKIE_NAME}=`))).toBe(true)
  })

  it('GET / — health is public and still reachable without auth', async () => {
    const res = await request(app.getHttpServer()).get('/').expect(200)
    expect(res.body).toEqual({ status: 'ok', service: 'confluent-api', version: '0.0.1' })
  })
})
