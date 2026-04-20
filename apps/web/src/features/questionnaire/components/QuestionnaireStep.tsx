import type { FormEvent, KeyboardEvent } from 'react'
import { WizardInput } from '@/components/confluent/WizardInput'
import { Button } from '@/components/ui/button'
import { stripNonPrintable } from '@/lib/sanitize'
import type { QuestionMeta } from '@/data/questionnaire'

export interface QuestionnaireStepProps {
  question: QuestionMeta
  indicatorText: string
  value: string
  onChange: (next: string) => void
  onAdvance: (cleaned: string) => void
  onBack: () => void
  canGoBack: boolean
}

const ANSWER_MAX_LENGTH = 2000

export function QuestionnaireStep({
  question,
  indicatorText,
  value,
  onChange,
  onAdvance,
  onBack,
  canGoBack,
}: QuestionnaireStepProps) {
  const cleaned = stripNonPrintable(value).trim()
  const canAdvance = cleaned.length > 0
  const headingId = 'questionnaire-current-question'

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.nativeEvent.isComposing) {
      if (e.key === 'Enter') e.preventDefault()
      return
    }
    if (
      e.key === 'ArrowUp' &&
      canGoBack &&
      !e.shiftKey &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.altKey
    ) {
      e.preventDefault()
      onBack()
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!canAdvance) return
    onAdvance(cleaned)
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mx-auto flex max-w-xl flex-col gap-6 pt-8"
    >
      <div className="text-xs text-muted-foreground">{indicatorText}</div>

      <h1
        id={headingId}
        className="font-heading text-[22px] font-bold leading-tight text-foreground md:text-[28px]"
      >
        {question.label}
      </h1>

      {question.hint && (
        <p className="text-sm text-muted-foreground">{question.hint}</p>
      )}

      <WizardInput
        key={question.id}
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        aria-labelledby={headingId}
        maxLength={ANSWER_MAX_LENGTH}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          size="lg"
          className="h-11 px-4"
          disabled={!canAdvance}
        >
          OK <span aria-hidden="true">→</span>
        </Button>
        <span
          className="text-xs text-muted-foreground"
          aria-hidden="true"
        >
          ou Entrée ↵
        </span>
      </div>

      <div className="pt-2">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="h-11 w-11 md:h-7 md:w-7"
          onClick={onBack}
          disabled={!canGoBack}
          aria-label="Question précédente"
        >
          ‹
        </Button>
      </div>
    </form>
  )
}
