import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { LoaderCircleIcon } from 'lucide-react'
import { ConfluentWordmark } from '@/components/confluent/ConfluentWordmark'
import { Button } from '@/components/ui/button'
import { verifyMagicLink } from '@/features/auth/api'

type Status = 'pending' | 'error'

export default function AuthVerifyRoute() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<Status>('pending')

  useEffect(() => {
    let cancelled = false
    const token = params.get('token')
    if (!token) {
      queueMicrotask(() => {
        if (!cancelled) setStatus('error')
      })
      return () => {
        cancelled = true
      }
    }
    void (async () => {
      try {
        const user = await verifyMagicLink(token)
        if (cancelled) return
        const target = user.role === 'admin' ? '/admin' : '/dashboard'
        navigate(target, { replace: true })
      } catch {
        if (!cancelled) setStatus('error')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [params, navigate])

  return (
    <>
      <title>Vérification · Confluent</title>
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 py-12">
        <ConfluentWordmark className="h-7 w-auto text-foreground" />
        {status === 'pending' ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
            <LoaderCircleIcon
              className="size-4 animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
            Vérification de votre lien…
          </div>
        ) : (
          <div className="flex w-full max-w-sm flex-col items-center gap-3 text-center">
            <h1 className="font-heading text-2xl font-medium text-foreground">
              Lien invalide ou expiré
            </h1>
            <p className="text-sm text-muted-foreground">
              Le lien a peut-être expiré ou déjà été utilisé.
            </p>
            <Button size="lg" onClick={() => navigate('/auth', { replace: true })}>
              Demander un nouveau lien
            </Button>
          </div>
        )}
      </main>
    </>
  )
}
