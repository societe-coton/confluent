import { useParams } from 'react-router-dom'
import { ConfluentWordmark } from '@/components/confluent/ConfluentWordmark'
import { getSharedDossier } from '@/features/share-access/api'
import { useAsync } from '@/lib/useAsync'
import { AccessDeniedPage } from '@/routes/share/AccessDeniedPage'

export default function ShareDossierRoute() {
  const { token } = useParams<{ token: string }>()
  if (!token) return <AccessDeniedPage />
  return <ShareDossierView token={token} />
}

function ShareDossierView({ token }: { token: string }) {
  const { data, isLoading, error } = useAsync(() => getSharedDossier(token), [token])

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
        <p className="text-sm text-muted-foreground">Chargement du dossier…</p>
      </main>
    )
  }
  if (error || !data) return <AccessDeniedPage />

  return (
    <>
      <title>{data.dossier.name} · Confluent</title>
      <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-8 bg-background px-6 py-8 lg:max-w-3xl lg:px-10">
        <ConfluentWordmark className="h-6 w-auto text-foreground" />
        <header className="flex flex-col gap-2">
          <h1 className="font-heading text-2xl font-semibold text-foreground md:text-3xl">
            {data.dossier.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Accès accordé à{' '}
            <span className="font-medium text-foreground">{data.share.recipientEmail}</span>
          </p>
        </header>
        {/* TODO: étendre /shares/:token côté API pour exposer answers + documents (FinanceurShareResponse ne contient actuellement que dossier.name/slug/id). */}
        <section className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
          Le contenu détaillé du dossier (réponses au questionnaire, pièces jointes)
          sera exposé prochainement. En attendant, l&apos;entrepreneur peut être
          contacté à l&apos;adresse fournie lors de l&apos;invitation.
        </section>
      </main>
    </>
  )
}
