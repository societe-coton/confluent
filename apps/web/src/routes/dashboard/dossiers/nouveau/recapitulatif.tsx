import { useEffect, useRef } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { CircleCheckIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { slugify } from '@/lib/slugify'
import { TOTAL_QUESTIONS } from '@/data/questionnaire'

const DRAFT_NAME_KEY = 'confluent_draft_name'

function draftKey(name: string) {
  return `confluent_draft_${name}`
}

function dossierKey(slug: string) {
  return `confluent_dossier_${slug}`
}

function isDraftComplete(dossierName: string): boolean {
  const rawDraft = localStorage.getItem(draftKey(dossierName))
  if (!rawDraft) return true
  try {
    const parsed = JSON.parse(rawDraft) as { position?: unknown }
    if (
      typeof parsed.position !== 'number' ||
      !Number.isFinite(parsed.position)
    ) {
      return false
    }
    return parsed.position >= TOTAL_QUESTIONS
  } catch {
    return false
  }
}

export default function RecapitulatifRoute() {
  const dossierName = localStorage.getItem(DRAFT_NAME_KEY)
  if (!dossierName) {
    return <Navigate to="/dashboard" replace />
  }
  if (!isDraftComplete(dossierName)) {
    return (
      <Navigate to="/dashboard/dossiers/nouveau/questionnaire" replace />
    )
  }
  return <CompletionView dossierName={dossierName} />
}

function CompletionView({ dossierName }: { dossierName: string }) {
  const navigate = useNavigate()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const slug = slugify(dossierName)

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!slug) return
    const rawKey = draftKey(dossierName)
    const slugKey = dossierKey(slug)
    const rawRaw = localStorage.getItem(rawKey)
    if (!rawRaw) return
    const existingSlug = localStorage.getItem(slugKey)
    if (existingSlug) {
      try {
        const existingDraft = JSON.parse(existingSlug) as { updatedAt?: string }
        const rawDraft = JSON.parse(rawRaw) as { updatedAt?: string }
        const a = Date.parse(existingDraft.updatedAt ?? '')
        const b = Date.parse(rawDraft.updatedAt ?? '')
        if (Number.isFinite(a) && Number.isFinite(b) && a >= b) {
          localStorage.removeItem(rawKey)
          return
        }
      } catch {
        // fall through to overwrite
      }
    }
    localStorage.setItem(slugKey, rawRaw)
    localStorage.removeItem(rawKey)
  }, [dossierName, slug])

  function handleViewDossier() {
    localStorage.removeItem(DRAFT_NAME_KEY)
    navigate(`/dashboard/dossiers/view/${slug}`)
  }

  function handleRestart() {
    localStorage.removeItem(DRAFT_NAME_KEY)
    localStorage.removeItem(draftKey(dossierName))
    navigate('/dashboard/dossiers/nouveau')
  }

  if (!slug) {
    return (
      <>
        <title>Nom de dossier invalide · Confluent</title>
        <section className="mx-auto flex max-w-md flex-col items-center gap-6 pt-16 text-center">
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="font-heading text-2xl font-semibold text-foreground focus-visible:outline-none"
          >
            Nom de dossier invalide
          </h1>
          <p className="text-sm text-muted-foreground">
            Le nom «&nbsp;{dossierName}&nbsp;» ne contient ni lettre ni chiffre et
            ne peut pas servir d&apos;adresse pour votre dossier. Veuillez
            recommencer avec un autre nom.
          </p>
          <Button
            type="button"
            size="lg"
            className="h-11 px-4"
            onClick={handleRestart}
          >
            Recommencer
          </Button>
        </section>
      </>
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
          Votre dossier {dossierName} est prêt. Vous pouvez maintenant le
          consulter et le partager.
        </p>
        <Button
          type="button"
          size="lg"
          className="h-11 px-4"
          onClick={handleViewDossier}
        >
          Voir mon dossier
        </Button>
      </section>
    </>
  )
}
