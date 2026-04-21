import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  QUESTIONNAIRE,
  QUESTIONNAIRE_FLAT,
  TOTAL_QUESTIONS,
} from '@/data/questionnaire'
import { QuestionnaireProgress } from '@/features/questionnaire/components/QuestionnaireProgress'
import { QuestionnaireStep } from '@/features/questionnaire/components/QuestionnaireStep'
import { SectionSummary } from '@/features/questionnaire/components/SectionSummary'
import { slugify } from '@/lib/slugify'

const DRAFT_NAME_KEY = 'confluent_draft_name'

function draftAnswersKey(name: string) {
  return `confluent_draft_${name}`
}

interface DraftState {
  answers: Record<string, string>
  position: number
  view: 'question' | 'summary'
  updatedAt: string
}

function emptyDraft(): DraftState {
  return {
    answers: {},
    position: 1,
    view: 'question',
    updatedAt: new Date().toISOString(),
  }
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
    const clampedQuestion = QUESTIONNAIRE_FLAT[clamped - 1]
    const isValidSummaryPosition =
      draft.view === 'summary' &&
      clampedQuestion.sectionIndex < 3 &&
      clamped === lastGlobalIndexOfSection(clampedQuestion.sectionId)
    const view: 'question' | 'summary' = isValidSummaryPosition
      ? 'summary'
      : 'question'
    return {
      answers: draft.answers,
      position: clamped,
      view,
      updatedAt: draft.updatedAt ?? new Date().toISOString(),
    }
  } catch {
    return emptyDraft()
  }
}

function lastGlobalIndexOfSection(sectionId: string): number {
  const sectionMetas = QUESTIONNAIRE_FLAT.filter(
    (q) => q.sectionId === sectionId,
  )
  if (sectionMetas.length === 0) return TOTAL_QUESTIONS
  return sectionMetas[sectionMetas.length - 1].globalIndex
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
  const [editingFromSummary, setEditingFromSummary] = useState(false)
  const editingRef = useRef(editingFromSummary)
  useEffect(() => {
    editingRef.current = editingFromSummary
  }, [editingFromSummary])
  const { answers, position, view } = draft

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
      if (editingRef.current) return
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
      setDraft((prev) => {
        if (prev.view === 'summary') return prev
        if (prev.position <= 1) return prev
        setDirection('backward')
        return {
          ...prev,
          position: prev.position - 1,
          updatedAt: new Date().toISOString(),
        }
      })
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
  const indicatorText =
    view === 'summary'
      ? `Récapitulatif · Section ${currentQuestion.sectionIndex} · ${currentSection.title}`
      : `Section ${currentQuestion.sectionIndex} · Question ${currentQuestion.positionInSection} sur ${currentSection.questions.length}`

  function handleAdvance(cleaned: string) {
    const nextAnswers = { ...answers, [currentQuestion.id]: cleaned }

    if (editingFromSummary) {
      setEditingFromSummary(false)
      setDirection('forward')
      patchDraft({
        answers: nextAnswers,
        position: lastGlobalIndexOfSection(currentQuestion.sectionId),
        view: 'summary',
      })
      return
    }

    if (position >= TOTAL_QUESTIONS) {
      const finalDraft: DraftState = {
        answers: nextAnswers,
        position,
        view: 'question',
        updatedAt: new Date().toISOString(),
      }
      const slug = slugify(dossierName)
      const rawKey = draftAnswersKey(dossierName)
      if (slug) {
        localStorage.setItem(
          `confluent_dossier_${slug}`,
          JSON.stringify(finalDraft),
        )
        localStorage.removeItem(rawKey)
      } else {
        localStorage.setItem(rawKey, JSON.stringify(finalDraft))
      }
      setDraft(finalDraft)
      navigate('/dashboard/dossiers/nouveau/recapitulatif')
      return
    }

    const isSectionBoundary =
      currentQuestion.positionInSection ===
        currentSection.questions.length && currentQuestion.sectionIndex < 3
    if (isSectionBoundary) {
      setDirection('forward')
      patchDraft({ answers: nextAnswers, view: 'summary' })
      return
    }

    setDirection('forward')
    patchDraft({ answers: nextAnswers, position: position + 1 })
  }

  function handleBack() {
    if (editingFromSummary) return
    if (position > 1) {
      setDirection('backward')
      patchDraft({ position: position - 1 })
    }
  }

  function handleAnswerChange(next: string) {
    patchDraft({ answers: { ...answers, [currentQuestion.id]: next } })
  }

  function handleEditFromSummary(targetGlobalIndex: number) {
    setEditingFromSummary(true)
    setDirection('backward')
    patchDraft({ position: targetGlobalIndex, view: 'question' })
  }

  function handleReturnToSummary() {
    setEditingFromSummary(false)
    setDirection('forward')
    patchDraft({
      position: lastGlobalIndexOfSection(currentQuestion.sectionId),
      view: 'summary',
    })
  }

  function handleValidateSection() {
    setDirection('forward')
    patchDraft({
      position: position + 1,
      view: 'question',
    })
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
        key={`${view}-${position}`}
        className={
          direction === 'forward'
            ? 'motion-safe:animate-slide-up-in'
            : 'motion-safe:animate-slide-down-in'
        }
      >
        {view === 'summary' ? (
          <SectionSummary
            section={currentSection}
            sectionIndex={currentQuestion.sectionIndex}
            answers={answers}
            onEdit={handleEditFromSummary}
            onValidate={handleValidateSection}
          />
        ) : (
          <QuestionnaireStep
            question={currentQuestion}
            indicatorText={indicatorText}
            value={answers[currentQuestion.id] ?? ''}
            onChange={handleAnswerChange}
            onAdvance={handleAdvance}
            onBack={handleBack}
            canGoBack={!editingFromSummary && position > 1}
            returnToSummary={
              editingFromSummary
                ? { onReturn: handleReturnToSummary }
                : undefined
            }
          />
        )}
      </div>
    </>
  )
}
