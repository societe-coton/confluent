import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { LoaderCircleIcon } from 'lucide-react'
import { ConfluentWordmark } from '@/components/confluent/ConfluentWordmark'
import { getSharedDossier } from '@/features/share-access/api'
import { AccessDeniedPage } from '@/routes/share/AccessDeniedPage'

type ResolutionState =
  | { status: 'loading' }
  | { status: 'ok' }
  | { status: 'denied' }

export default function ShareRoute() {
  const { token } = useParams<{ token: string }>()
  if (!token) return <AccessDeniedPage />
  return <ShareResolver token={token} />
}

function ShareResolver({ token }: { token: string }) {
  const [state, setState] = useState<ResolutionState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    getSharedDossier(token)
      .then(() => {
        if (!cancelled) setState({ status: 'ok' })
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'denied' })
      })
    return () => {
      cancelled = true
    }
  }, [token])

  if (state.status === 'denied') return <AccessDeniedPage />
  if (state.status === 'ok') {
    return <Navigate to={`/share/${encodeURIComponent(token)}/dossier`} replace />
  }

  return (
    <>
      <title>Accéder au dossier · Confluent</title>
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 py-12">
        <ConfluentWordmark className="h-7 w-auto text-foreground" />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircleIcon
            aria-hidden="true"
            className="size-4 animate-spin motion-reduce:animate-none"
          />
          Vérification du lien…
        </div>
      </main>
    </>
  )
}
