import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import type { UserRole } from '@confluent/shared'
import './index.css'
import App from './App.tsx'

export type _CrossWorkspaceTypeCheck = UserRole

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
