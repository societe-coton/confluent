// Current user resolution: prefers the real JWT session from `authStore` (Epic 6.6),
// falls back to the dev-only `?as=...` impersonation fixture for demo/offline flows.

import { createContext, use, useEffect, useState, type ReactNode } from 'react'
import type { CurrentUser } from '@confluent/shared'
import { getAuthState, subscribeAuth, type AuthUser } from '@/features/auth/auth-store'

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

function resolveImpersonatedUser(): CurrentUser {
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

function fromAuth(authUser: AuthUser): CurrentUser {
  return {
    id: authUser.id,
    name: authUser.email,
    email: authUser.email,
    role: authUser.role,
  }
}

function resolveCurrentUser(): CurrentUser {
  const { user } = getAuthState()
  return user ? fromAuth(user) : resolveImpersonatedUser()
}

const CurrentUserContext = createContext<CurrentUser | null>(null)

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser>(resolveCurrentUser)
  useEffect(() => {
    const unsubscribe = subscribeAuth(() => setUser(resolveCurrentUser()))
    return () => {
      unsubscribe()
    }
  }, [])
  return <CurrentUserContext value={user}>{children}</CurrentUserContext>
}

export function useCurrentUser(): CurrentUser {
  const user = use(CurrentUserContext)
  if (user === null) {
    throw new Error('useCurrentUser must be used within a CurrentUserProvider')
  }
  return user
}
