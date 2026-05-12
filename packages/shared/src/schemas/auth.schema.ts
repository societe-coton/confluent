import { z } from 'zod'
import { userRoleSchema } from './user.schema.js'

export const magicLinkRequestSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
})

export const issuedSessionSchema = z.object({
  accessToken: z.string().min(1),
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    role: userRoleSchema,
  }),
})

export type MagicLinkRequest = z.infer<typeof magicLinkRequestSchema>
export type IssuedSession = z.infer<typeof issuedSessionSchema>
