import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import DashboardRoute from '@/routes/dashboard'
import TableauDeBordRoute from '@/routes/dashboard/tableau-de-bord'
import DossierNewRoute from '@/routes/dashboard/dossiers/nouveau'
import QuestionnaireRoute from '@/routes/dashboard/dossiers/nouveau/questionnaire'
import RecapitulatifRoute from '@/routes/dashboard/dossiers/nouveau/recapitulatif'
import DossierViewRoute from '@/routes/dashboard/dossiers/[slug]'
import AdminRoute from '@/routes/admin'
import ShareRoute from '@/routes/share'
import ShareDossierRoute from '@/routes/share/dossier'
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
      {
        path: 'dashboard/dossiers/nouveau',
        element: <DossierNewRoute />,
        handle: { hideBreadcrumb: true },
      },
      {
        path: 'dashboard/dossiers/nouveau/questionnaire',
        element: <QuestionnaireRoute />,
        handle: { hideBreadcrumb: true },
      },
      {
        path: 'dashboard/dossiers/nouveau/recapitulatif',
        element: <RecapitulatifRoute />,
        handle: { hideBreadcrumb: true },
      },
      {
        path: 'dashboard/dossiers/view/:slug',
        element: <DossierViewRoute />,
        handle: { hideBreadcrumb: true },
      },
      { path: 'admin', element: <AdminRoute /> },
      { path: '*', element: <NotFoundRoute /> },
    ],
  },
  { path: '/share/:token', element: <ShareRoute /> },
  { path: '/share/:token/dossier', element: <ShareDossierRoute /> },
  { path: '/auth', element: <AuthRoute /> },
])
