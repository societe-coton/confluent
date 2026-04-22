import type { MouseEvent } from 'react'
import { ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type {
  BuilderActionTarget,
  BuilderFieldType,
  BuilderSection,
} from '@/data/mock-questionnaire-builder'

interface QuestionnaireBuilderSectionProps {
  readonly section: BuilderSection
  readonly onModifierClick: (target: BuilderActionTarget) => void
}

function fieldTypeLabel(t: BuilderFieldType): string {
  switch (t) {
    case 'text':
      return 'Texte'
    case 'number':
      return 'Nombre'
    case 'select':
      return 'Sélection'
    default: {
      const exhaustive: never = t
      return exhaustive
    }
  }
}

export default function QuestionnaireBuilderSection({
  section,
  onModifierClick,
}: QuestionnaireBuilderSectionProps) {
  function handleSectionModifier(event: MouseEvent<HTMLButtonElement>) {
    // Prevent the parent <summary> from toggling the <details> open state.
    event.preventDefault()
    onModifierClick({ type: 'section', sectionId: section.id })
  }

  return (
    <details className="group overflow-hidden rounded-lg border border-border bg-card">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 marker:hidden hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--ring)]">
        <div className="flex min-w-0 items-center gap-3">
          <ChevronRight
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90"
          />
          <span className="truncate font-medium text-foreground">
            {section.title}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs tabular-nums text-muted-foreground">
            {section.fields.length} champs
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSectionModifier}
          >
            Modifier
          </Button>
        </div>
      </summary>

      <ul
        role="list"
        className="divide-y divide-border border-t border-border"
      >
        {section.fields.map((field) => (
          <li
            key={field.id}
            className="flex flex-col gap-1 px-4 py-3 md:flex-row md:items-center md:gap-4"
          >
            <span className="min-w-0 break-words text-sm text-foreground md:flex-1">
              {field.label}
            </span>
            <span className="shrink-0 font-mono text-xs text-muted-foreground">
              {fieldTypeLabel(field.fieldType)}
            </span>
            <Badge
              variant={field.required ? 'default' : 'secondary'}
              className="shrink-0"
            >
              {field.required ? 'Requis' : 'Optionnel'}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0"
              onClick={() =>
                onModifierClick({
                  type: 'field',
                  sectionId: section.id,
                  fieldId: field.id,
                })
              }
            >
              Modifier
            </Button>
          </li>
        ))}
      </ul>
    </details>
  )
}
