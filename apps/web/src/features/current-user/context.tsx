import { createContext, use, type ReactNode } from 'react'
import type { User } from '@confluent/shared'

const HARDCODED_USER: User = {
  id: 'hardcoded-1',
  name: 'Sophie Moreau',
  email: 'sophie@biosensio.fr',
  role: 'entrepreneur',
}

const CurrentUserContext = createContext<User | null>(null)

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  return <CurrentUserContext value={HARDCODED_USER}>{children}</CurrentUserContext>
}

export function useCurrentUser(): User {
  const user = use(CurrentUserContext)
  if (user === null) {
    throw new Error('useCurrentUser must be used within a CurrentUserProvider')
  }
  return user
}
