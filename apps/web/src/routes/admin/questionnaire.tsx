import { useCallback, useEffect, useRef } from 'react'
import { Navigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import QuestionnaireBuilderSection from '@/components/confluent/QuestionnaireBuilderSection'
import { useCurrentUser } from '@/features/current-user/context'
import {
  QUESTIONNAIRE_BUILDER,
  TOTAL_BUILDER_FIELDS,
  type BuilderActionTarget,
} from '@/data/mock-questionnaire-builder'

export default function AdminQuestionnaireRoute() {
  const user = useCurrentUser()
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return <AdminQuestionnaireBuilder />
}

function AdminQuestionnaireBuilder() {
  const headingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  const handleModifierClick = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- `_target` is the forward-shape for Epic 9.2's per-target edit dialogs.
    (_target: BuilderActionTarget) => {
      toast.message('Disponible prochainement', {
        id: 'builder-coming-soon',
        description:
          "La configuration sera activée avec l'API dans une prochaine version.",
      })
    },
    [],
  )

  return (
    <>
      <title>Questionnaire · Confluent</title>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="font-heading text-2xl font-semibold text-foreground md:text-[28px] focus-visible:outline-none"
      >
        Questionnaire
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Structure actuelle du questionnaire d&apos;intake. La configuration sera
        activée avec l&apos;API.
      </p>

      <section className="mt-8">
        <div className="mb-4 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="font-heading text-xl font-semibold text-foreground md:text-2xl">
              Sections
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {QUESTIONNAIRE_BUILDER.length} sections · {TOTAL_BUILDER_FIELDS} champs
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleModifierClick({ type: 'sections' })}
          >
            Modifier la structure
          </Button>
        </div>

        <ul role="list" className="flex flex-col gap-3">
          {QUESTIONNAIRE_BUILDER.map((section) => (
            <li key={section.id}>
              <QuestionnaireBuilderSection
                section={section}
                onModifierClick={handleModifierClick}
              />
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
