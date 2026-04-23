// Dev-only role impersonation (Story 5.1). Replaced by Epic 6.3's JWT
// session (architecture.md:164-170) when real auth wiring lands.

import { createContext, use, useState, type ReactNode } from 'react'
import type { CurrentUser } from '@confluent/shared'

export const MOCK_ENTREPRENEUR_USER: CurrentUser = {
  id: 'mock-entrepreneur-1',
  name: 'Sophie Moreau',
  email: 'sophie@biosensio.fr',
  role: 'entrepreneur',
}

export const MOCK_ADMIN_USER: CurrentUser = {
  id: 'mock-admin-1',
  name: 'Claire Martin',
  email: 'claire@frenchtech-cvl.fr',
  role: 'admin',
}

export const DEV_ROLE_STORAGE_KEY = 'confluent_dev_role'

function resolveCurrentUser(): CurrentUser {
  if (typeof window === 'undefined') return MOCK_ENTREPRENEUR_USER
  try {
    const url = new URL(window.location.href)
    const as = url.searchParams.get('as')
    if (as === 'admin' || as === 'entrepreneur') {
      window.sessionStorage.setItem(DEV_ROLE_STORAGE_KEY, as)
      url.searchParams.delete('as')
      window.history.replaceState(null, '', url.pathname + url.search + url.hash)
    }
    const stored = window.sessionStorage.getItem(DEV_ROLE_STORAGE_KEY)
    return stored === 'admin' ? MOCK_ADMIN_USER : MOCK_ENTREPRENEUR_USER
  } catch {
    return MOCK_ENTREPRENEUR_USER
  }
}

const CurrentUserContext = createContext<CurrentUser | null>(null)

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [user] = useState<CurrentUser>(resolveCurrentUser)
  return <CurrentUserContext value={user}>{children}</CurrentUserContext>
}

export function useCurrentUser(): CurrentUser {
  const user = use(CurrentUserContext)
  if (user === null) {
    throw new Error('useCurrentUser must be used within a CurrentUserProvider')
  }
  return user
}
