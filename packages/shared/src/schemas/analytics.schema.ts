import { z } from 'zod'
import { shareLinkStatusSchema } from './share-link.schema.js'

export const perRecipientAnalyticsSchema = z.object({
  shareLinkId: z.string().uuid(),
  recipientEmail: z.string().email(),
  status: shareLinkStatusSchema,
  viewCount: z.number().int().nonnegative(),
  lastViewedAt: z.string().datetime().nullable(),
})

export const dossierAnalyticsSchema = z.object({
  activeRecipients: z.number().int().nonnegative(),
  totalViews: z.number().int().nonnegative(),
  avgSessionDurationSeconds: z.number().nullable(),
  perRecipient: z.array(perRecipientAnalyticsSchema),
})

export const platformAnalyticsSchema = z.object({
  totalDossiers: z.number().int().nonnegative(),
  activeThisMonth: z.number().int().nonnegative(),
  bySector: z.array(
    z.object({
      sector: z.string().nullable(),
      count: z.number().int().nonnegative(),
    }),
  ),
  byMaturityStage: z.array(
    z.object({
      stage: z.string().nullable(),
      count: z.number().int().nonnegative(),
    }),
  ),
  totalShareLinks: z.number().int().nonnegative(),
  totalViewsThisMonth: z.number().int().nonnegative(),
})

export type PerRecipientAnalytics = z.infer<typeof perRecipientAnalyticsSchema>
export type DossierAnalytics = z.infer<typeof dossierAnalyticsSchema>
export type PlatformAnalytics = z.infer<typeof platformAnalyticsSchema>
