import type { ActiveQuestionnaire } from '@confluent/shared'
import { publicApiRequest } from '@/lib/api-client'

export function getActiveQuestionnaire(): Promise<ActiveQuestionnaire> {
  return publicApiRequest<ActiveQuestionnaire>('/v1/questionnaires/active')
}
