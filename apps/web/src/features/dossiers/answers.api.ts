import type { AnswerInput } from '@confluent/shared'
import { apiRequest } from '@/lib/api-client'

export interface AnswerRow {
  id: string
  dossierId: string
  fieldId: string
  value: string
  createdAt: string
  updatedAt: string
}

export function listAnswers(dossierId: string): Promise<AnswerRow[]> {
  return apiRequest<AnswerRow[]>(
    `/v1/dossiers/${encodeURIComponent(dossierId)}/answers`,
  )
}

export function upsertAnswers(
  dossierId: string,
  answers: AnswerInput[],
): Promise<AnswerRow[]> {
  return apiRequest<AnswerRow[]>(
    `/v1/dossiers/${encodeURIComponent(dossierId)}/answers`,
    {
      method: 'PUT',
      body: JSON.stringify({ answers }),
    },
  )
}
