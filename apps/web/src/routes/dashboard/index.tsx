import { useNavigate } from 'react-router-dom'
import { EmptyState } from '@/components/confluent/EmptyState'
import { EmptyDossiersIllustration } from '@/components/confluent/illustrations/EmptyDossiersIllustration'

export default function DashboardRoute() {
  const navigate = useNavigate()

  return (
    <>
      <title>Dashboard · Confluent</title>
      <h1 className="text-2xl font-heading font-medium">Mes dossiers</h1>
      <EmptyState
        illustration={<EmptyDossiersIllustration />}
        title="Aucun dossier pour l'instant"
        description="Créez votre premier dossier pour commencer à partager votre projet avec des investisseurs."
        cta={{
          label: 'Créer un dossier',
          onClick: () => navigate('/dashboard/dossiers/nouveau'),
        }}
      />
    </>
  )
}
