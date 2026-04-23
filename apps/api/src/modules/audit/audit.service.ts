import { Injectable, Logger } from '@nestjs/common'
import type { audit_action } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'

export interface AuditLogEntry {
  actionType: audit_action
  actorId?: string | null
  dossierId?: string | null
  shareLinkId?: string | null
  metadata?: Record<string, unknown>
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name)

  constructor(private readonly prisma: PrismaService) {}

  async record(entry: AuditLogEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          actionType: entry.actionType,
          actorId: entry.actorId ?? null,
          dossierId: entry.dossierId ?? null,
          shareLinkId: entry.shareLinkId ?? null,
          metadata: (entry.metadata ?? {}) as never,
        },
      })
    } catch (err) {
      this.logger.warn(
        `Audit write failed for ${entry.actionType}: ${err instanceof Error ? err.message : String(err)}`,
      )
    }
  }
}
