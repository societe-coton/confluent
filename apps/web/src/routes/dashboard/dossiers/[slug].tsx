import { useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { QUESTIONNAIRE, QUESTIONNAIRE_FLAT } from '@/data/questionnaire'
import { DossierField } from '@/components/confluent/DossierField'

interface PersistedDraft {
  answers: Record<string, string>
  position?: number
  view?: 'question' | 'summary'
  updatedAt?: string
}

function loadDossier(slug: string): { answers: Record<string, string> } | null {
  try {
    const raw = localStorage.getItem(`confluent_dossier_${slug}`)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedDraft
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      typeof parsed.answers !== 'object' ||
      parsed.answers === null
    ) {
      return null
    }
    const entries = Object.entries(parsed.answers).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string',
    )
    if (entries.length === 0) return null
    return { answers: Object.fromEntries(entries) }
  } catch {
    return null
  }
}

function deslugifyForDisplay(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
    .join(' ')
}

export default function DossierViewRoute() {
  const { slug } = useParams<{ slug: string }>()
  const dossier = slug ? loadDossier(slug) : null
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [slug])

  if (!slug || !dossier) {
    return (
      <section className="mx-auto max-w-md pt-16 text-center">
        <title>Dossier introuvable · Confluent</title>
        <p className="text-sm text-muted-foreground">Dossier introuvable.</p>
        <Link
          to="/dashboard"
          className="mt-4 inline-block text-sm underline hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
        >
          Retour au tableau de bord
        </Link>
      </section>
    )
  }

  const displayName = deslugifyForDisplay(slug)

  return (
    <div className="mx-auto max-w-[720px]">
      <title>{displayName} · Confluent</title>
      <nav aria-label="Fil d'Ariane" className="mb-4">
        <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <li>
            <Link
              to="/dashboard"
              className="rounded-sm hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
            >
              Dossiers
            </Link>
          </li>
          <li className="flex items-center gap-1.5">
            <span aria-hidden="true" className="text-muted-foreground/60">
              /
            </span>
            <span aria-current="page" className="font-medium text-foreground">
              {displayName}
            </span>
          </li>
        </ol>
      </nav>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="font-heading text-2xl font-semibold text-foreground md:text-[28px] focus-visible:outline-none"
      >
        {displayName}
      </h1>
      <div className="mt-10 flex flex-col gap-10">
        {QUESTIONNAIRE.map((section, i) => {
          const sectionMetas = QUESTIONNAIRE_FLAT.filter(
            (q) => q.sectionId === section.id,
          )
          return (
            <section key={section.id}>
              <h2 className="font-heading text-xl font-semibold text-foreground md:text-2xl">
                {i + 1}. {section.title}
              </h2>
              <dl className="mt-4 flex flex-col gap-6">
                {sectionMetas.map((q) => (
                  <DossierField
                    key={q.id}
                    label={q.label}
                    value={dossier.answers[q.id] ?? ''}
                  />
                ))}
              </dl>
            </section>
          )
        })}
      </div>
    </div>
  )
}
