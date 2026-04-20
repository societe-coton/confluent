import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  QUESTIONNAIRE,
  QUESTIONNAIRE_FLAT,
  TOTAL_QUESTIONS,
} from '@/data/questionnaire'
import { QuestionnaireProgress } from '@/features/questionnaire/components/QuestionnaireProgress'
import { QuestionnaireStep } from '@/features/questionnaire/components/QuestionnaireStep'

const DRAFT_NAME_KEY = 'confluent_draft_name'

function draftAnswersKey(name: string) {
  return `confluent_draft_${name}`
}

interface DraftState {
  answers: Record<string, string>
  position: number
  updatedAt: string
}

function emptyDraft(): DraftState {
  return { answers: {}, position: 1, updatedAt: new Date().toISOString() }
}

function loadDraft(dossierName: string): DraftState {
  try {
    const raw = localStorage.getItem(draftAnswersKey(dossierName))
    if (!raw) return emptyDraft()
    const parsed = JSON.parse(raw) as unknown
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      typeof (parsed as DraftState).position !== 'number' ||
      !Number.isFinite((parsed as DraftState).position) ||
      typeof (parsed as DraftState).answers !== 'object' ||
      (parsed as DraftState).answers === null
    ) {
      return emptyDraft()
    }
    const draft = parsed as DraftState
    const clamped = Math.min(Math.max(1, draft.position), TOTAL_QUESTIONS)
    return {
      answers: draft.answers,
      position: clamped,
      updatedAt: draft.updatedAt ?? new Date().toISOString(),
    }
  } catch {
    return emptyDraft()
  }
}

export default function QuestionnaireRoute() {
  const dossierName = localStorage.getItem(DRAFT_NAME_KEY)
  if (!dossierName) {
    return <Navigate to="/dashboard/dossiers/nouveau" replace />
  }

  return <QuestionnaireWizard dossierName={dossierName} />
}

function QuestionnaireWizard({ dossierName }: { dossierName: string }) {
  const navigate = useNavigate()
  const [draft, setDraft] = useState<DraftState>(() => loadDraft(dossierName))
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
  const { answers, position } = draft

  useEffect(() => {
    localStorage.setItem(
      draftAnswersKey(dossierName),
      JSON.stringify(draft),
    )
  }, [dossierName, draft])

  useEffect(() => {
    function onDocumentKeyDown(e: KeyboardEvent) {
      if (e.key !== 'ArrowUp') return
      if (e.isComposing) return
      if (e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) return
      const target = e.target as HTMLElement | null
      if (
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        target?.isContentEditable
      ) {
        return
      }
      e.preventDefault()
      setDirection('backward')
      setDraft((prev) =>
        prev.position > 1
          ? {
              ...prev,
              position: prev.position - 1,
              updatedAt: new Date().toISOString(),
            }
          : prev,
      )
    }
    window.addEventListener('keydown', onDocumentKeyDown)
    return () => window.removeEventListener('keydown', onDocumentKeyDown)
  }, [])

  function patchDraft(patch: Partial<Omit<DraftState, 'updatedAt'>>) {
    setDraft((prev) => ({
      ...prev,
      ...patch,
      updatedAt: new Date().toISOString(),
    }))
  }

  const currentQuestion = QUESTIONNAIRE_FLAT[position - 1]
  const currentSection = QUESTIONNAIRE.find(
    (s) => s.id === currentQuestion.sectionId,
  )!
  const indicatorText = `Section ${currentQuestion.sectionIndex} · Question ${currentQuestion.positionInSection} sur ${currentSection.questions.length}`

  function handleAdvance(cleaned: string) {
    const nextAnswers = { ...answers, [currentQuestion.id]: cleaned }
    if (position >= TOTAL_QUESTIONS) {
      const finalDraft: DraftState = {
        answers: nextAnswers,
        position,
        updatedAt: new Date().toISOString(),
      }
      localStorage.setItem(
        draftAnswersKey(dossierName),
        JSON.stringify(finalDraft),
      )
      setDraft(finalDraft)
      navigate('/dashboard/dossiers/nouveau/recapitulatif')
      return
    }
    setDirection('forward')
    patchDraft({ answers: nextAnswers, position: position + 1 })
  }

  function handleBack() {
    if (position > 1) {
      setDirection('backward')
      patchDraft({ position: position - 1 })
    }
  }

  function handleAnswerChange(next: string) {
    patchDraft({ answers: { ...answers, [currentQuestion.id]: next } })
  }

  return (
    <>
      <title>Questionnaire · Confluent</title>
      <div className="-mx-6 -mt-8">
        <QuestionnaireProgress position={position} total={TOTAL_QUESTIONS} />
      </div>
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {indicatorText}
      </div>
      <div
        key={position}
        className={
          direction === 'forward'
            ? 'motion-safe:animate-slide-up-in'
            : 'motion-safe:animate-slide-down-in'
        }
      >
        <QuestionnaireStep
          question={currentQuestion}
          indicatorText={indicatorText}
          value={answers[currentQuestion.id] ?? ''}
          onChange={handleAnswerChange}
          onAdvance={handleAdvance}
          onBack={handleBack}
          canGoBack={position > 1}
        />
      </div>
    </>
  )
}
