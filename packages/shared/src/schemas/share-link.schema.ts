import { z } from 'zod';

export const shareLinkStatusSchema = z.enum(['pending', 'active', 'revoked', 'expired']);

export const shareLinkSchema = z.object({
  id: z.string().uuid(),
  dossierId: z.string().uuid(),
  recipientEmail: z.string().email(),
  token: z.string().uuid(),
  status: shareLinkStatusSchema,
  createdAt: z.string().datetime(),
  revokedAt: z.string().datetime().nullable(),
});

export const createShareLinkSchema = z.object({
  recipientEmail: z.string().trim().toLowerCase().email(),
});

export type ShareLinkStatus = z.infer<typeof shareLinkStatusSchema>;
export type ShareLink = z.infer<typeof shareLinkSchema>;
export type CreateShareLinkInput = z.infer<typeof createShareLinkSchema>;
