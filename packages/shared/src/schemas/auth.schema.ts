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
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
  }),
})

export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
})

export type MagicLinkRequest = z.infer<typeof magicLinkRequestSchema>
export type IssuedSession = z.infer<typeof issuedSessionSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
