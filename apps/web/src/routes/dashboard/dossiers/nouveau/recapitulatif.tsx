import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { CircleCheckIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getDossier, submitDossier } from '@/features/dossiers/api'
import { useAsync } from '@/lib/useAsync'
import type { ApiError } from '@/lib/api-client'

export default function RecapitulatifRoute() {
  const [searchParams] = useSearchParams()
  const dossierId = searchParams.get('dossierId')
  if (!dossierId) {
    return <Navigate to="/dashboard" replace />
  }
  return <CompletionView dossierId={dossierId} />
}

function CompletionView({ dossierId }: { dossierId: string }) {
  const navigate = useNavigate()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const { data: dossier, isLoading, error } = useAsync(() => getDossier(dossierId), [dossierId])
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  async function handleViewDossier() {
    if (!dossier) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const submitted = await submitDossier(dossierId)
      navigate(`/dashboard/dossiers/view/${submitted.slug}`)
    } catch (err) {
      const apiErr = err as ApiError
      setSubmitError(apiErr?.message ?? 'Impossible de finaliser le dossier. Réessayez.')
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return <p className="pt-8 text-sm text-muted-foreground">Chargement…</p>
  }
  if (error || !dossier) {
    return (
      <p className="pt-8 text-sm text-destructive">
        Impossible de charger le dossier.
      </p>
    )
  }

  return (
    <>
      <title>Dossier complété · Confluent</title>
      <section className="mx-auto flex max-w-md flex-col items-center gap-6 pt-16 text-center">
        <CircleCheckIcon
          size={48}
          aria-hidden="true"
          className="text-status-active"
        />
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="font-heading text-2xl font-semibold text-foreground focus-visible:outline-none"
        >
          Dossier complété{' '}!
        </h1>
        <p className="text-sm text-muted-foreground">
          Votre dossier {dossier.name} est prêt. Vous pouvez maintenant le
          consulter et le partager.
        </p>
        {submitError && (
          <p className="text-xs text-destructive" role="alert">
            {submitError}
          </p>
        )}
        <Button
          type="button"
          size="lg"
          className="h-11 px-4"
          onClick={handleViewDossier}
          disabled={submitting}
        >
          {submitting ? 'Finalisation…' : 'Voir mon dossier'}
        </Button>
      </section>
    </>
  )
}
