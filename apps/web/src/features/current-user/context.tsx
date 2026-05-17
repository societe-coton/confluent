// Current user resolution: prefers the real JWT session from `authStore` (Epic 6.6),
// falls back to the dev-only `?as=...` impersonation fixture for demo/offline flows.

import { createContext, use, useEffect, useState, type ReactNode } from 'react'
import type { CurrentUser } from '@confluent/shared'
import { getAuthState, subscribeAuth, type AuthUser } from '@/features/auth/auth-store'
import { initAuth } from '@/features/auth/api'

export const MOCK_ENTREPRENEUR_USER: CurrentUser = {
  id: 'mock-entrepreneur-1',
  name: 'Sophie Moreau',
  firstName: 'Sophie',
  email: 'sophie@biosensio.fr',
  role: 'entrepreneur',
}

export const MOCK_ADMIN_USER: CurrentUser = {
  id: 'mock-admin-1',
  name: 'Claire Martin',
  firstName: 'Claire',
  email: 'claire@frenchtech-cvl.fr',
  role: 'admin',
}

export const DEV_ROLE_STORAGE_KEY = 'confluent_dev_role'

function resolveImpersonatedUser(): CurrentUser | null {
  if (typeof window === 'undefined') return null
  try {
    const url = new URL(window.location.href)
    const as = url.searchParams.get('as')
    if (as === 'admin' || as === 'entrepreneur') {
      window.sessionStorage.setItem(DEV_ROLE_STORAGE_KEY, as)
      url.searchParams.delete('as')
      window.history.replaceState(null, '', url.pathname + url.search + url.hash)
    }
    const stored = window.sessionStorage.getItem(DEV_ROLE_STORAGE_KEY)
    if (stored === 'admin') return MOCK_ADMIN_USER
    if (stored === 'entrepreneur') return MOCK_ENTREPRENEUR_USER
    return null
  } catch {
    return null
  }
}

function fromAuth(authUser: AuthUser): CurrentUser {
  const first = authUser.firstName?.trim() ?? ''
  const last = authUser.lastName?.trim() ?? ''
  const name = [first, last].filter(Boolean).join(' ') || authUser.email
  return {
    id: authUser.id,
    name,
    firstName: authUser.firstName ?? null,
    email: authUser.email,
    role: authUser.role,
  }
}

function resolveCurrentUser(): CurrentUser | null {
  const { user } = getAuthState()
  return user ? fromAuth(user) : resolveImpersonatedUser()
}

interface AuthContextValue {
  user: CurrentUser | null
  loading: boolean
}

const CurrentUserContext = createContext<AuthContextValue | undefined>(undefined)

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initAuth()
      .then(() => setUser(resolveCurrentUser()))
      .finally(() => setLoading(false))
    const unsubscribe = subscribeAuth(() => setUser(resolveCurrentUser()))
    return () => {
      unsubscribe()
    }
  }, [])

  return <CurrentUserContext value={{ user, loading }}>{children}</CurrentUserContext>
}

export function useCurrentUser(): CurrentUser {
  const ctx = use(CurrentUserContext)
  if (ctx === undefined) {
    throw new Error('useCurrentUser must be used within a CurrentUserProvider')
  }
  if (!ctx.user) {
    throw new Error('useCurrentUser called without an authenticated user')
  }
  return ctx.user
}

export function useAuthState(): AuthContextValue {
  const ctx = use(CurrentUserContext)
  if (ctx === undefined) {
    throw new Error('useAuthState must be used within a CurrentUserProvider')
  }
  return ctx
}
