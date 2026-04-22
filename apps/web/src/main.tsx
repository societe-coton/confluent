import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import type { UserRole } from '@confluent/shared'
import { Toaster } from '@/components/ui/sonner'
import { CurrentUserProvider } from '@/features/current-user/context'
import { router } from './router'
import './index.css'

export type _CrossWorkspaceTypeCheck = UserRole

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CurrentUserProvider>
      <Toaster />
      <RouterProvider router={router} />
    </CurrentUserProvider>
  </StrictMode>,
)
