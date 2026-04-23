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

export type ShareLinkStatus = z.infer<typeof shareLinkStatusSchema>;
export type ShareLink = z.infer<typeof shareLinkSchema>;
