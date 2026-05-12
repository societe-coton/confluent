import type { AuditLog } from '@confluent/shared'
import { apiRequest } from '@/lib/api-client'

export function getDossierAuditLog(dossierId: string): Promise<AuditLog[]> {
  return apiRequest<AuditLog[]>(
    `/v1/dossiers/${encodeURIComponent(dossierId)}/audit-log`,
  )
}

export function getAdminDossierAuditLog(dossierId: string): Promise<AuditLog[]> {
  return apiRequest<AuditLog[]>(
    `/v1/admin/dossiers/${encodeURIComponent(dossierId)}/audit-log`,
  )
}
