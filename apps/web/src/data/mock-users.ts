// Static mock fixture for the Story 5.4 admin user management view. Replaced by Epic 9.3's real admin user management API (architecture.md:602-605 — admin module) when data persistence lands.

import type { UserRole } from '@confluent/shared'

export type UserStatus = 'active' | 'inactive'

export interface MockUser {
  readonly id: string
  readonly email: string
  readonly role: UserRole
  readonly status: UserStatus
}

export const MOCK_USERS: readonly MockUser[] = [
  { id: 'user-1', email: 'sophie@biosensio.fr', role: 'entrepreneur', status: 'active' },
  { id: 'user-2', email: 'lucas@agrotrack.fr', role: 'entrepreneur', status: 'inactive' },
  { id: 'user-3', email: 'marc@capital-invest.fr', role: 'financeur', status: 'active' },
  { id: 'user-4', email: 'julie@fonds-regional.fr', role: 'financeur', status: 'inactive' },
  { id: 'user-5', email: 'claire@frenchtech-cvl.fr', role: 'admin', status: 'active' },
] as const
