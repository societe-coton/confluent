import { z } from 'zod'

export const answerSchema = z.object({
  fieldId: z.string().uuid(),
  value: z.string().max(10_000),
})

export const upsertAnswersSchema = z.object({
  answers: z.array(answerSchema).max(500),
})

export type AnswerInput = z.infer<typeof answerSchema>
export type UpsertAnswersInput = z.infer<typeof upsertAnswersSchema>
