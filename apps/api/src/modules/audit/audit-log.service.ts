import { Injectable } from '@nestjs/common'
import type { AuditLog } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'

const OPS_ONLY_ACTIONS = new Set(['rate_limit_exceeded', 'share_link_access_denied'])

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  listForEntrepreneur(dossierId: string): Promise<AuditLog[]> {
    return this.prisma.auditLog.findMany({
      where: { dossierId, actionType: { notIn: [...OPS_ONLY_ACTIONS] as never } },
      orderBy: { createdAt: 'desc' },
    })
  }

  listForAdmin(dossierId: string): Promise<AuditLog[]> {
    return this.prisma.auditLog.findMany({
      where: { dossierId },
      orderBy: { createdAt: 'desc' },
    })
  }
}
