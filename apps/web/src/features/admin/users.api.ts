import type { User, UserRole } from '@confluent/shared'
import { apiRequest } from '@/lib/api-client'

export function listUsers(): Promise<User[]> {
  return apiRequest<User[]>('/v1/admin/users')
}

export function inviteUser(email: string, role: UserRole): Promise<User> {
  return apiRequest<User>('/v1/admin/users/invite', {
    method: 'POST',
    body: JSON.stringify({ email, role }),
  })
}

export function deactivateUser(id: string): Promise<User> {
  return apiRequest<User>(
    `/v1/admin/users/${encodeURIComponent(id)}/deactivate`,
    { method: 'PATCH' },
  )
}

export function reactivateUser(id: string): Promise<User> {
  return apiRequest<User>(
    `/v1/admin/users/${encodeURIComponent(id)}/reactivate`,
    { method: 'PATCH' },
  )
}
