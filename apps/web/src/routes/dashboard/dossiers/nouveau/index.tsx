import { useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { WizardInput } from '@/components/confluent/WizardInput'
import { Button } from '@/components/ui/button'
import { stripNonPrintable } from '@/lib/sanitize'

const DRAFT_NAME_KEY = 'confluent_draft_name'
const NAME_MAX_LENGTH = 120

export default function DossierNewRoute() {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState(
    () => localStorage.getItem(DRAFT_NAME_KEY) ?? '',
  )
  const [showError, setShowError] = useState(false)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const cleaned = stripNonPrintable(name).trim()
    if (!cleaned) {
      setShowError(true)
      inputRef.current?.focus()
      return
    }
    localStorage.setItem(DRAFT_NAME_KEY, cleaned)
    navigate('/dashboard/dossiers/nouveau/questionnaire')
  }

  return (
    <>
      <title>Nouveau dossier · Confluent</title>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="mx-auto flex max-w-md flex-col gap-6 pt-8"
      >
        <label
          htmlFor="dossier-name"
          className="font-heading text-2xl font-medium text-foreground"
        >
          Comment s&apos;appelle votre projet&nbsp;?
        </label>
        <WizardInput
          ref={inputRef}
          id="dossier-name"
          autoFocus
          maxLength={NAME_MAX_LENGTH}
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            if (showError) setShowError(false)
          }}
          aria-invalid={showError || undefined}
          aria-describedby={showError ? 'dossier-name-error' : undefined}
        />
        <div
          aria-live="assertive"
          aria-atomic="true"
          className="min-h-[1em]"
        >
          {showError && (
            <p id="dossier-name-error" className="text-xs text-destructive">
              Le nom du projet est requis.
            </p>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Vous pourrez modifier ce nom plus tard.
        </p>
        <Button type="submit" size="lg" className="h-11 self-start px-4">
          Commencer →
        </Button>
      </form>
    </>
  )
}
