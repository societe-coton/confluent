import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { LoaderCircleIcon } from 'lucide-react'
import { ConfluentWordmark } from '@/components/confluent/ConfluentWordmark'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { stripNonPrintable } from '@/lib/sanitize'

const MOCK_SEND_DELAY_MS = 1000

export default function ShareRoute() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<number | null>(null)
  const [email, setEmail] = useState('')
  const [showError, setShowError] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cleaned = stripNonPrintable(email).trim()
    if (!cleaned) {
      setShowError(true)
      inputRef.current?.focus()
      return
    }
    setShowError(false)
    setSubmitting(true)
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null
      navigate(`/share/${encodeURIComponent(token ?? '')}/dossier`)
    }, MOCK_SEND_DELAY_MS)
  }

  return (
    <>
      <title>Accéder au dossier · Confluent</title>
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 py-12">
        <ConfluentWordmark className="h-7 w-auto text-foreground" />
        <div className="flex w-full max-w-sm flex-col gap-2 text-center">
          <h1 className="font-heading text-2xl font-medium text-foreground sm:text-[28px]">
            Accéder au dossier
          </h1>
          <p className="text-sm text-muted-foreground">
            Entrez votre adresse email pour recevoir votre lien d&apos;accès.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          noValidate={false}
          className="flex w-full max-w-sm flex-col gap-3"
        >
          <label htmlFor="share-email" className="sr-only">
            Adresse email
          </label>
          <Input
            ref={inputRef}
            id="share-email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            placeholder="votre@email.fr"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (showError) setShowError(false)
            }}
            aria-invalid={showError || undefined}
            aria-describedby={showError ? 'share-email-error' : undefined}
            disabled={submitting}
            className="h-11 w-full"
          />
          <div
            aria-live="assertive"
            aria-atomic="true"
            className="min-h-[1em]"
          >
            {showError && (
              <p
                id="share-email-error"
                role="alert"
                className="text-xs text-destructive"
              >
                L&apos;adresse email est requise.
              </p>
            )}
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={submitting}
            className="h-11 w-full"
          >
            {submitting ? (
              <>
                <LoaderCircleIcon
                  data-icon="inline-start"
                  className="size-4 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
                Envoi du lien…
              </>
            ) : (
              'Recevoir mon lien de connexion'
            )}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Pas de mot de passe — vérifiez votre boîte mail
          </p>
        </form>
      </main>
    </>
  )
}
