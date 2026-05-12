import type { FinanceurShareResponse } from '@confluent/shared'
import { publicApiRequest } from '@/lib/api-client'

export function getSharedDossier(token: string): Promise<FinanceurShareResponse> {
  return publicApiRequest<FinanceurShareResponse>(
    `/shares/${encodeURIComponent(token)}`,
  )
}
