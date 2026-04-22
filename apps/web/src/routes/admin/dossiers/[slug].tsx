import { useEffect, useRef } from 'react'
import { Info } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { DossierField } from '@/components/confluent/DossierField'
import { QUESTIONNAIRE, QUESTIONNAIRE_FLAT } from '@/data/questionnaire'
import { MOCK_ADMIN_DOSSIERS } from '@/data/mock-admin-dossiers'
import { useCurrentUser } from '@/features/current-user/context'

export default function AdminDossierDetailRoute() {
  const user = useCurrentUser()
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return <AdminDossierDetailView />
}

function AdminDossierDetailView() {
  const { slug } = useParams<{ slug: string }>()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const dossier = slug
    ? MOCK_ADMIN_DOSSIERS.find((d) => d.slug === slug)
    : undefined

  useEffect(() => {
    headingRef.current?.focus()
  }, [slug])

  if (!dossier) {
    return (
      <section className="mx-auto max-w-md pt-16 text-center">
        <title>Dossier introuvable · Confluent</title>
        <p className="text-sm text-muted-foreground">Dossier introuvable.</p>
        <Link
          to="/admin/dossiers"
          className="mt-4 inline-block text-sm underline hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
        >
          Retour à la liste
        </Link>
      </section>
    )
  }

  return (
    <div className="mx-auto max-w-[720px]">
      <title>{dossier.name} · Confluent</title>

      <nav aria-label="Fil d'Ariane" className="mb-4">
        <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <li>
            <Link
              to="/admin"
              className="rounded-sm hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
            >
              Admin
            </Link>
          </li>
          <li className="flex items-center gap-1.5">
            <span aria-hidden="true" className="text-muted-foreground/60">
              /
            </span>
            <Link
              to="/admin/dossiers"
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
              {dossier.name}
            </span>
          </li>
        </ol>
      </nav>

      <h1
        ref={headingRef}
        tabIndex={-1}
        className="font-heading text-2xl font-semibold text-foreground md:text-[28px] focus-visible:outline-none"
      >
        {dossier.name}
      </h1>

      <div
        role="note"
        className="mt-4 flex items-start gap-3 rounded-md border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground"
      >
        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-foreground" />
        <p>Vous consultez ce dossier en tant qu&apos;administrateur.</p>
      </div>

      {dossier.answers ? (
        <div className="mt-8 flex flex-col gap-10">
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
                      value={dossier.answers?.[q.id] ?? ''}
                    />
                  ))}
                </dl>
              </section>
            )
          })}
        </div>
      ) : (
        <p className="mt-8 text-sm text-muted-foreground">
          Ce dossier n&apos;a pas encore de contenu renseigné.
        </p>
      )}
    </div>
  )
}
