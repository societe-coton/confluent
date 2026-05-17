import { z } from 'zod'

export const fieldTypeSchema = z.enum([
  'text',
  'textarea',
  'email',
  'number',
  'date',
  'select',
  'checkbox',
  'file',
])

export const questionnaireVersionSchema = z.object({
  id: z.string().uuid(),
  version: z.number().int().positive(),
  isPublished: z.boolean(),
  createdAt: z.string().datetime(),
})

export const questionnaireFieldSchema = z.object({
  id: z.string().uuid(),
  versionId: z.string().uuid(),
  section: z.string(),
  label: z.string(),
  fieldType: fieldTypeSchema,
  options: z.array(z.string()).default([]),
  required: z.boolean(),
  orderIndex: z.number().int().nonnegative(),
})

export const activeQuestionnaireSchema = z.object({
  version: questionnaireVersionSchema,
  fields: z.array(questionnaireFieldSchema),
})

export const createQuestionnaireVersionFieldSchema = z.object({
  section: z.string().min(1).max(200),
  label: z.string().min(1).max(500),
  fieldType: fieldTypeSchema,
  required: z.boolean(),
  orderIndex: z.number().int().nonnegative(),
})

export const createQuestionnaireVersionSchema = z.object({
  fields: z.array(createQuestionnaireVersionFieldSchema).min(1).max(500),
})

export const patchQuestionnaireFieldSchema = z
  .object({
    label: z.string().min(1).max(500).optional(),
    fieldType: fieldTypeSchema.optional(),
    required: z.boolean().optional(),
  })
  .refine((v) => Object.values(v).some((x) => x !== undefined), {
    message: 'At least one field must be provided.',
  })

export type FieldType = z.infer<typeof fieldTypeSchema>
export type QuestionnaireVersion = z.infer<typeof questionnaireVersionSchema>
export type QuestionnaireField = z.infer<typeof questionnaireFieldSchema>
export type ActiveQuestionnaire = z.infer<typeof activeQuestionnaireSchema>
export type CreateQuestionnaireVersionFieldInput = z.infer<
  typeof createQuestionnaireVersionFieldSchema
>
export type CreateQuestionnaireVersionInput = z.infer<typeof createQuestionnaireVersionSchema>
export type PatchQuestionnaireFieldInput = z.infer<typeof patchQuestionnaireFieldSchema>
