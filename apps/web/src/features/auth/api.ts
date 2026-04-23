import { publicApiRequest } from '@/lib/api-client'
import { setAuth, type AuthUser } from './auth-store'

interface SessionResponse {
  accessToken: string
  user: AuthUser
}

export async function requestMagicLink(email: string): Promise<void> {
  await publicApiRequest<{ message: string }>('/v1/auth/magic-link', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export async function verifyMagicLink(token: string): Promise<AuthUser> {
  const body = await publicApiRequest<SessionResponse>(
    `/v1/auth/verify?token=${encodeURIComponent(token)}`,
    { method: 'GET' },
  )
  setAuth({ accessToken: body.accessToken, user: body.user })
  return body.user
}

export async function logout(): Promise<void> {
  try {
    await publicApiRequest<{ message: string }>('/v1/auth/logout', { method: 'POST' })
  } finally {
    setAuth(null)
  }
}
