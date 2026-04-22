import { useEffect, useRef } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useCurrentUser } from '@/features/current-user/context'
import { MOCK_ADMIN_DOSSIERS } from '@/data/mock-admin-dossiers'
import { formatRelativeDate } from '@/lib/relative-date'
import { cn } from '@/lib/utils'

export default function AdminDossiersRoute() {
  const user = useCurrentUser()
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return <AdminDossiersList />
}

function AdminDossiersList() {
  const headingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <>
      <title>Dossiers · Confluent</title>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="font-heading text-2xl font-semibold text-foreground md:text-[28px] focus-visible:outline-none"
      >
        Dossiers
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Tous les dossiers présents sur la plateforme.
      </p>

      <ul
        role="list"
        aria-label="Liste des dossiers de la plateforme"
        className="mt-8 flex flex-col gap-3 md:hidden"
      >
        {MOCK_ADMIN_DOSSIERS.map((d) => (
          <li key={d.slug} className="flex">
            <Link
              to={`/admin/dossiers/${d.slug}`}
              className="group flex min-h-11 flex-1 flex-col gap-2 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-foreground/20 focus-visible:border-foreground/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
            >
              <h2 className="min-w-0 break-words text-base font-medium text-foreground">
                {d.name}
              </h2>
              <p className="text-xs text-muted-foreground">{d.entrepreneurEmail}</p>
              <p className="text-xs text-muted-foreground">{d.sector}</p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 hidden overflow-hidden rounded-lg border border-border bg-card md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th scope="col" className="px-4 py-3 font-medium">Dossier</th>
              <th scope="col" className="px-4 py-3 font-medium">Entrepreneur</th>
              <th scope="col" className="px-4 py-3 font-medium">Secteur</th>
              <th scope="col" className="px-4 py-3 font-medium">Stade</th>
              <th scope="col" className="px-4 py-3 font-medium">Créé</th>
              <th scope="col" className="px-4 py-3 font-medium">Accès actifs</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {MOCK_ADMIN_DOSSIERS.map((d) => (
              <tr
                key={d.slug}
                className="relative transition-colors hover:bg-muted/50 focus-within:bg-muted/50"
              >
                <td className="px-4 py-3">
                  <Link
                    to={`/admin/dossiers/${d.slug}`}
                    className={cn(
                      'rounded-sm font-medium text-foreground',
                      'after:absolute after:inset-0 after:content-[""]',
                      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]',
                    )}
                  >
                    {d.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{d.entrepreneurEmail}</td>
                <td className="px-4 py-3 text-muted-foreground">{d.sector}</td>
                <td className="px-4 py-3 text-muted-foreground">{d.maturity}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatRelativeDate(d.createdAt)}
                </td>
                <td className="px-4 py-3 tabular-nums text-muted-foreground">
                  {d.activeShareLinksCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
