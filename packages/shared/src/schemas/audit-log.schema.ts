import { z } from 'zod';

export const auditActionSchema = z.enum([
  'magic_link_requested',
  'magic_link_consumed',
  'share_link_created',
  'share_link_viewed',
  'share_link_revoked',
  'dossier_created',
  'dossier_updated',
  'dossier_classified',
  'questionnaire_version_published',
  'user_deactivated',
  'user_reactivated',
  'rate_limit_exceeded',
  'share_link_access_denied',
]);

export const auditLogSchema = z.object({
  id: z.string().uuid(),
  dossierId: z.string().uuid().nullable(),
  actorId: z.string().uuid().nullable(),
  shareLinkId: z.string().uuid().nullable(),
  actionType: auditActionSchema,
  metadata: z.record(z.string(), z.unknown()),
  createdAt: z.string().datetime(),
});

export type AuditAction = z.infer<typeof auditActionSchema>;
export type AuditLog = z.infer<typeof auditLogSchema>;
