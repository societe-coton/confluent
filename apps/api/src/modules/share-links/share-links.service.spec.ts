import { Test } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ShareLinksService } from './share-links.service'
import { PrismaService } from '../../prisma/prisma.service'
import { AuditService } from '../audit/audit.service'
import { DossiersService } from '../dossiers/dossiers.service'
import { EMAIL_TRANSPORT } from '../auth/email/email-transport'

function buildModule(overrides: {
  getByIdForUser?: jest.Mock
  shareCreate?: jest.Mock
  shareFindUnique?: jest.Mock
  shareUpdate?: jest.Mock
  shareFindMany?: jest.Mock
  userFindUnique?: jest.Mock
  userCreate?: jest.Mock
  sendShareInvite?: jest.Mock
  sendMagicLink?: jest.Mock
  auditRecord?: jest.Mock
}) {
  return {
    prisma: {
      shareLink: {
        create: overrides.shareCreate ?? jest.fn().mockResolvedValue({ id: 'sl-1' }),
        findUnique: overrides.shareFindUnique ?? jest.fn(),
        update: overrides.shareUpdate ?? jest.fn(),
        findMany: overrides.shareFindMany ?? jest.fn().mockResolvedValue([]),
      },
      dossier: { findUnique: jest.fn() },
      user: {
        findUnique: overrides.userFindUnique ?? jest.fn().mockResolvedValue(null),
        create:
          overrides.userCreate ??
          jest
            .fn()
            .mockImplementation(async (args: { data: Record<string, unknown> }) =>
              Promise.resolve({ id: 'recipient-1', locale: 'fr', ...args.data }),
            ),
      },
    },
    audit: { record: overrides.auditRecord ?? jest.fn().mockResolvedValue(undefined) },
    config: {
      get: (k: string) =>
        ({
          FRONTEND_URL: 'https://app.confluent',
          SMTP_FROM: 'noreply@confluent.local',
        })[k],
    },
    dossiers: {
      getByIdForUser:
        overrides.getByIdForUser ??
        jest.fn().mockResolvedValue({ id: 'd-1', userId: 'u-1', name: 'Biosensio' }),
    },
    email: {
      sendMagicLink: overrides.sendMagicLink ?? jest.fn().mockResolvedValue(undefined),
      sendShareInvite: overrides.sendShareInvite ?? jest.fn().mockResolvedValue(undefined),
    },
  }
}

async function instantiate(mocks: ReturnType<typeof buildModule>): Promise<ShareLinksService> {
  const moduleRef = await Test.createTestingModule({
    providers: [
      ShareLinksService,
      { provide: PrismaService, useValue: mocks.prisma },
      { provide: AuditService, useValue: mocks.audit },
      { provide: ConfigService, useValue: mocks.config },
      { provide: DossiersService, useValue: mocks.dossiers },
      { provide: EMAIL_TRANSPORT, useValue: mocks.email },
    ],
  }).compile()
  return moduleRef.get(ShareLinksService)
}

describe('ShareLinksService', () => {
  it('creates a share link with a CSPRNG token + dispatches email + audits', async () => {
    const mocks = buildModule({
      shareCreate: jest
        .fn()
        .mockImplementation(async (args: { data: Record<string, unknown> }) =>
          Promise.resolve({ id: 'sl-1', createdAt: new Date(), revokedAt: null, ...args.data }),
        ),
    })
    const svc = await instantiate(mocks)

    const result = await svc.create({
      dossierId: 'd-1',
      userId: 'u-1',
      recipientEmail: 'bob@invest.fr',
    })
    expect(result.shareUrl).toMatch(/^https:\/\/app\.confluent\/share\/[0-9a-f-]{36}$/)
    expect(mocks.audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        actionType: 'share_link_created',
        dossierId: 'd-1',
        metadata: expect.objectContaining({
          recipientUserId: 'recipient-1',
          createdNewUser: true,
        }),
      }),
    )
    expect(mocks.email.sendShareInvite).toHaveBeenCalledTimes(1)
    expect(mocks.email.sendShareInvite).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'bob@invest.fr',
        dossierName: 'Biosensio',
        locale: 'fr',
      }),
    )
  })

  it('upserts the recipient as a financeur user when unknown', async () => {
    const userCreate = jest.fn().mockResolvedValue({
      id: 'new-user',
      email: 'bob@invest.fr',
      role: 'financeur',
      isActive: true,
      emailVerifiedAt: null,
      locale: 'fr',
    })
    const mocks = buildModule({
      userFindUnique: jest.fn().mockResolvedValue(null),
      userCreate,
    })
    const svc = await instantiate(mocks)

    await svc.create({ dossierId: 'd-1', userId: 'u-1', recipientEmail: 'bob@invest.fr' })

    expect(userCreate).toHaveBeenCalledWith({
      data: {
        email: 'bob@invest.fr',
        role: 'financeur',
        isActive: true,
        emailVerifiedAt: null,
      },
    })
  })

  it('does not create the user when recipient already exists', async () => {
    const existing = {
      id: 'existing-1',
      email: 'lea@fund.io',
      role: 'admin',
      isActive: false,
      emailVerifiedAt: null,
      locale: 'fr',
    }
    const userCreate = jest.fn()
    const mocks = buildModule({
      userFindUnique: jest.fn().mockResolvedValue(existing),
      userCreate,
    })
    const svc = await instantiate(mocks)

    await svc.create({ dossierId: 'd-1', userId: 'u-1', recipientEmail: 'lea@fund.io' })

    expect(userCreate).not.toHaveBeenCalled()
    expect(mocks.audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          recipientUserId: 'existing-1',
          createdNewUser: false,
        }),
      }),
    )
  })

  it('revoke sets status + revokedAt and audits share_link_revoked', async () => {
    const mocks = buildModule({
      shareFindUnique: jest.fn().mockResolvedValue({ id: 'sl-2', dossierId: 'd-1' }),
      shareUpdate: jest.fn().mockResolvedValue({
        id: 'sl-2',
        status: 'revoked',
        revokedAt: new Date(),
      }),
    })
    const svc = await instantiate(mocks)

    const result = await svc.revoke('d-1', 'sl-2', 'u-1')
    expect(result.status).toBe('revoked')
    expect(mocks.audit.record).toHaveBeenCalledWith(
      expect.objectContaining({ actionType: 'share_link_revoked', shareLinkId: 'sl-2' }),
    )
  })

  it('revoke throws 404 when the link does not belong to the dossier', async () => {
    const mocks = buildModule({
      shareFindUnique: jest.fn().mockResolvedValue({ id: 'sl-2', dossierId: 'other' }),
    })
    const svc = await instantiate(mocks)
    await expect(svc.revoke('d-1', 'sl-2', 'u-1')).rejects.toBeInstanceOf(NotFoundException)
  })
})
