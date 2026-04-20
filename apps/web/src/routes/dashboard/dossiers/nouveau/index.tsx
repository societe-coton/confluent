import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { WizardInput } from '@/components/confluent/WizardInput'
import { Button } from '@/components/ui/button'

const DRAFT_NAME_KEY = 'confluent_draft_name'

export default function DossierNewRoute() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [showError, setShowError] = useState(false)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setShowError(true)
      return
    }
    localStorage.setItem(DRAFT_NAME_KEY, trimmed)
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
          id="dossier-name"
          autoFocus
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            if (showError) setShowError(false)
          }}
          aria-invalid={showError || undefined}
          aria-describedby={showError ? 'dossier-name-error' : undefined}
        />
        {showError && (
          <p
            id="dossier-name-error"
            role="alert"
            className="text-xs text-destructive"
          >
            Le nom du projet est requis.
          </p>
        )}
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
