import type { CurrentUser } from '@confluent/shared'

export interface AuthUser {
  id: string
  email: string
  role: CurrentUser['role']
}

export interface AuthState {
  accessToken: string | null
  user: AuthUser | null
}

let state: AuthState = { accessToken: null, user: null }
const listeners = new Set<() => void>()

export function getAuthState(): AuthState {
  return state
}

export function setAuth(next: { accessToken: string; user: AuthUser } | null): void {
  state = next === null ? { accessToken: null, user: null } : { ...next }
  listeners.forEach((l) => l())
}

export function setAccessToken(token: string | null): void {
  state = { ...state, accessToken: token }
  listeners.forEach((l) => l())
}

export function subscribeAuth(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
