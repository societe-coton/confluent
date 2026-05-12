import { MetricCard } from '@/components/confluent/MetricCard'
import { useDossiers } from '@/features/dossiers/hooks'

export default function TableauDeBordRoute() {
  const { data, isLoading, error } = useDossiers()
  const dossiers = data ?? []
  const submitted = dossiers.filter((d) => d.submittedAt !== null).length
  const drafts = dossiers.length - submitted

  return (
    <>
      <title>Tableau de bord · Confluent</title>
      <h1 className="font-heading text-2xl font-medium text-foreground md:text-[28px]">
        Tableau de bord
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Aperçu de vos dossiers et de leur activité.
      </p>
      {isLoading ? (
        <p className="mt-8 text-sm text-muted-foreground">Chargement…</p>
      ) : error ? (
        <p className="mt-8 text-sm text-destructive">
          Impossible de charger vos dossiers.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <MetricCard label="Dossiers total" value={dossiers.length.toString()} />
          <MetricCard label="Soumis" value={submitted.toString()} />
          <MetricCard label="Brouillons" value={drafts.toString()} />
        </div>
      )}
    </>
  )
}
