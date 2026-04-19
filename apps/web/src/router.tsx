import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import DashboardRoute from '@/routes/dashboard'
import TableauDeBordRoute from '@/routes/dashboard/tableau-de-bord'
import DossierNewRoute from '@/routes/dashboard/dossiers/nouveau'
import AdminRoute from '@/routes/admin'
import ShareRoute from '@/routes/share'
import AuthRoute from '@/routes/auth'
import NotFoundRoute from '@/routes/not-found'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardRoute /> },
      { path: 'dashboard/tableau-de-bord', element: <TableauDeBordRoute /> },
      { path: 'dashboard/dossiers', element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard/dossiers/nouveau', element: <DossierNewRoute /> },
      { path: 'admin', element: <AdminRoute /> },
      { path: '*', element: <NotFoundRoute /> },
    ],
  },
  { path: '/share/:token', element: <ShareRoute /> },
  { path: '/auth', element: <AuthRoute /> },
])
