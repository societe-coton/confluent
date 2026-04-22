import { Navigate } from 'react-router-dom'
import { MetricCard } from '@/components/confluent/MetricCard'
import { useCurrentUser } from '@/features/current-user/context'
import { MOCK_ADMIN_PIPELINE } from '@/data/mock-admin-pipeline'

export default function AdminRoute() {
  const user = useCurrentUser()
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />

  const { totalDossiers, activeThisMonth, sectors } = MOCK_ADMIN_PIPELINE
  return (
    <>
      <title>Pipeline · Confluent</title>
      <h1 className="font-heading text-2xl font-semibold text-foreground md:text-[28px]">
        Pipeline
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Vue d&apos;ensemble du pipeline régional.
      </p>

      <section className="mt-8">
        <h2 className="sr-only">Statistiques</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <MetricCard label="Dossiers total" value={totalDossiers.toString()} />
          <MetricCard label="Actifs ce mois" value={activeThisMonth.toString()} />
          <MetricCard label="Secteurs représentés" value={sectors.length.toString()} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-heading text-xl font-semibold text-foreground md:text-2xl">
          Répartition par secteur
        </h2>
        <div className="mt-4 overflow-hidden rounded-lg border border-border bg-card">
          <ul role="list" className="m-0 list-none divide-y divide-border p-0">
            {sectors.map((sector) => (
              <li
                key={sector.name}
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <span className="font-medium text-foreground">{sector.name}</span>
                <span className="text-muted-foreground tabular-nums">
                  {sector.dossierCount} dossiers
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
