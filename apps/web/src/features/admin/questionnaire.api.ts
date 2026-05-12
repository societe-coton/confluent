import type {
  CreateQuestionnaireVersionFieldInput,
  PatchQuestionnaireFieldInput,
  QuestionnaireField,
  QuestionnaireVersion,
} from '@confluent/shared'
import { apiRequest } from '@/lib/api-client'

export function listQuestionnaireVersions(): Promise<QuestionnaireVersion[]> {
  return apiRequest<QuestionnaireVersion[]>('/v1/admin/questionnaire/versions')
}

export function createQuestionnaireVersion(
  fields: CreateQuestionnaireVersionFieldInput[],
): Promise<QuestionnaireVersion> {
  return apiRequest<QuestionnaireVersion>('/v1/admin/questionnaire/versions', {
    method: 'POST',
    body: JSON.stringify({ fields }),
  })
}

export function patchQuestionnaireField(
  versionId: string,
  fieldId: string,
  patch: PatchQuestionnaireFieldInput,
): Promise<QuestionnaireField> {
  return apiRequest<QuestionnaireField>(
    `/v1/admin/questionnaire/versions/${encodeURIComponent(versionId)}/fields/${encodeURIComponent(fieldId)}`,
    { method: 'PATCH', body: JSON.stringify(patch) },
  )
}
