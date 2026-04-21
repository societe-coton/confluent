import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { DossierCard } from '@/components/confluent/DossierCard'
import { EmptyState } from '@/components/confluent/EmptyState'
import { EmptyDossiersIllustration } from '@/components/confluent/illustrations/EmptyDossiersIllustration'
import { MOCK_DOSSIERS } from '@/data/mock-dossiers'

export default function DashboardRoute() {
  const navigate = useNavigate()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const dossiers = MOCK_DOSSIERS

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  function goToNew() {
    navigate('/dashboard/dossiers/nouveau')
  }

  return (
    <>
      <title>Dashboard · Confluent</title>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="font-heading text-2xl font-semibold text-foreground md:text-[28px] focus-visible:outline-none"
        >
          Mes dossiers
        </h1>
        <Button
          type="button"
          size="lg"
          className="h-11 self-start px-4 sm:self-auto"
          onClick={goToNew}
        >
          Créer un dossier
        </Button>
      </div>
      {dossiers.length > 0 ? (
        <ul
          role="list"
          aria-label="Liste de vos dossiers"
          className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          {dossiers.map((d) => (
            <li key={d.slug} className="flex">
              <DossierCard
                slug={d.slug}
                name={d.name}
                sector={d.sector}
                maturity={d.maturity}
                activeShareLinksCount={d.activeShareLinksCount}
                createdAt={d.createdAt}
                className="flex-1"
              />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          illustration={<EmptyDossiersIllustration />}
          title="Aucun dossier pour l'instant"
          description="Créez votre premier dossier pour commencer à partager votre projet avec des investisseurs."
          cta={{ label: 'Créer un dossier', onClick: goToNew }}
        />
      )}
    </>
  )
}
