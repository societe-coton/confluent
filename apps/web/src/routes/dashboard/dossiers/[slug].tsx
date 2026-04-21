import { useEffect, useRef } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { DossierField } from '@/components/confluent/DossierField'
import { MetricCard } from '@/components/confluent/MetricCard'
import { QUESTIONNAIRE, QUESTIONNAIRE_FLAT } from '@/data/questionnaire'
import { MOCK_DOSSIERS } from '@/data/mock-dossiers'
import { MOCK_ANALYTICS } from '@/data/mock-analytics'
import { cn } from '@/lib/utils'

const TAB_VALUES = {
  content: 'content',
  analytics: 'analytics',
} as const

type TabValue = (typeof TAB_VALUES)[keyof typeof TAB_VALUES]

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
  const activeTab: TabValue =
    searchParams.get('tab') === TAB_VALUES.analytics
      ? TAB_VALUES.analytics
      : TAB_VALUES.content

  function handleTabChange(value: unknown) {
    if (typeof value !== 'string') return
    setSearchParams(
      (prev) => {
        if (value === TAB_VALUES.analytics) {
          prev.set('tab', TAB_VALUES.analytics)
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
          <TabsTrigger value={TAB_VALUES.content}>Contenu</TabsTrigger>
          <TabsTrigger value={TAB_VALUES.analytics}>
            Accès &amp; analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value={TAB_VALUES.content}>
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

        <TabsContent value={TAB_VALUES.analytics}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {MOCK_ANALYTICS.metrics.map((metric) => (
              <MetricCard
                key={metric.label}
                label={metric.label}
                value={metric.value}
              />
            ))}
          </div>

          <section className="mt-8">
            <h2 className="font-heading text-xl font-semibold text-foreground md:text-2xl">
              Accès &amp; partage
            </h2>
            <div className="mt-4 overflow-hidden rounded-lg border border-border bg-card">
              {MOCK_ANALYTICS.accessEntries.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                  Aucun destinataire pour le moment.
                </p>
              ) : (
                <ul role="list" className="m-0 list-none p-0">
                  {MOCK_ANALYTICS.accessEntries.map((entry, index) => (
                  <li
                    key={entry.email}
                    className={cn(
                      'flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between',
                      entry.status === 'revoked' && 'opacity-[0.55]',
                      index > 0 && 'border-t border-border',
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground"
                      >
                        {entry.initials}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p
                          className="truncate text-sm font-medium text-foreground"
                          title={entry.email}
                        >
                          {entry.email}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {entry.lastSeen}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <span className="text-[22px] font-bold text-foreground tabular-nums">
                        {entry.sessionDuration}
                      </span>
                      <span
                        aria-label={
                          entry.status === 'active'
                            ? 'Statut : Actif'
                            : entry.status === 'pending'
                              ? 'Statut : En attente'
                              : 'Statut : Révoqué'
                        }
                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground"
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            'inline-block size-[7px] rounded-full',
                            entry.status === 'active' &&
                              'bg-[var(--status-active)]',
                            entry.status === 'pending' &&
                              'bg-[var(--status-pending)]',
                            entry.status === 'revoked' &&
                              'bg-[var(--status-neutral)]',
                          )}
                        />
                        {entry.status === 'active'
                          ? 'Actif'
                          : entry.status === 'pending'
                            ? 'En attente'
                            : 'Révoqué'}
                      </span>
                      {entry.status === 'revoked' ? (
                        <span className="text-xs text-muted-foreground">
                          Révoqué le {entry.revokedAt}
                        </span>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          aria-label={`Révoquer l'accès de ${entry.email}`}
                          className="min-h-11"
                        >
                          Révoquer
                        </Button>
                      )}
                    </div>
                  </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  )
}
