import { useEffect, useRef } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { DossierField } from '@/components/confluent/DossierField'
import { QUESTIONNAIRE, QUESTIONNAIRE_FLAT } from '@/data/questionnaire'
import { MOCK_DOSSIERS } from '@/data/mock-dossiers'

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

function resolveDisplayName(slug: string): string {
  const mock = MOCK_DOSSIERS.find((d) => d.slug === slug)
  if (mock) return mock.name
  return deslugifyForDisplay(slug)
}

export default function DossierViewRoute() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const headingRef = useRef<HTMLHeadingElement>(null)

  const mock = slug ? MOCK_DOSSIERS.find((d) => d.slug === slug) : undefined
  const dossier = slug ? loadDossier(slug) : null

  useEffect(() => {
    headingRef.current?.focus()
  }, [slug])

  if (!slug || (!mock && !dossier)) {
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

  const displayName = resolveDisplayName(slug)
  const activeTab =
    searchParams.get('tab') === 'analytics' ? 'analytics' : 'content'

  function handleTabChange(value: unknown) {
    setSearchParams(
      (prev) => {
        if (value === 'analytics') {
          prev.set('tab', 'analytics')
        } else {
          prev.delete('tab')
        }
        return prev
      },
      { replace: true },
    )
  }

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

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="font-heading text-2xl font-semibold text-foreground md:text-[28px] focus-visible:outline-none"
        >
          {displayName}
        </h1>
        <Button
          type="button"
          size="lg"
          className="h-11 self-start px-4 sm:self-auto"
        >
          Partager
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-6">
        <TabsList>
          <TabsTrigger value="content">Contenu</TabsTrigger>
          <TabsTrigger value="analytics">Accès &amp; analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          {dossier ? (
            <div className="flex flex-col gap-10">
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
          ) : (
            <p className="text-sm text-muted-foreground">
              Ce dossier n&apos;a pas encore de contenu renseigné.
            </p>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
            <p>L&apos;analytique de ce dossier s&apos;affichera ici.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
