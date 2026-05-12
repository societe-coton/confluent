import type { DocumentGroup, UploadedDocument } from '@confluent/shared'
import { apiRequest } from '@/lib/api-client'

export function listDocuments(dossierId: string): Promise<DocumentGroup[]> {
  return apiRequest<DocumentGroup[]>(
    `/v1/dossiers/${encodeURIComponent(dossierId)}/documents`,
  )
}

export function uploadDocument(dossierId: string, file: File): Promise<UploadedDocument> {
  const formData = new FormData()
  formData.append('file', file)
  return apiRequest<UploadedDocument>(
    `/v1/dossiers/${encodeURIComponent(dossierId)}/documents`,
    {
      method: 'POST',
      body: formData,
    },
  )
}
