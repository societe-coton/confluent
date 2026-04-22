// Static mock fixture for the Story 5.3 admin questionnaire builder view. Replaced by Epic 9.2's real admin questionnaire API (architecture.md:602-605 — admin module) when data persistence lands.

import { QUESTIONNAIRE } from './questionnaire'

export type BuilderFieldType = 'text' | 'number' | 'select'

export interface BuilderField {
  readonly id: string
  readonly label: string
  readonly hint?: string
  readonly fieldType: BuilderFieldType
  readonly required: boolean
}

export interface BuilderSection {
  readonly id: string
  readonly title: string
  readonly fields: readonly BuilderField[]
}

export type BuilderActionTarget =
  | { type: 'sections' }
  | { type: 'section'; sectionId: string }
  | { type: 'field'; sectionId: string; fieldId: string }

interface FieldMeta {
  readonly fieldType: BuilderFieldType
  readonly required: boolean
}

const FIELD_META: Readonly<Record<string, FieldMeta>> = {
  // presentation
  'nom-projet': { fieldType: 'text', required: true },
  secteur: { fieldType: 'select', required: true },
  maturite: { fieldType: 'select', required: true },
  'description-courte': { fieldType: 'text', required: true },
  // produit-marche
  probleme: { fieldType: 'text', required: true },
  solution: { fieldType: 'text', required: true },
  'marche-cible': { fieldType: 'text', required: true },
  differenciateur: { fieldType: 'text', required: false },
  // finances-equipe
  montant: { fieldType: 'number', required: true },
  'usage-fonds': { fieldType: 'text', required: true },
  'taille-equipe': { fieldType: 'number', required: true },
  'profil-fondateur': { fieldType: 'text', required: false },
}

const buildFields = (
  section: (typeof QUESTIONNAIRE)[number],
): readonly BuilderField[] =>
  section.questions.map((q) => {
    const meta = FIELD_META[q.id]
    if (!meta) {
      throw new Error(`Missing builder metadata for question id: ${q.id}`)
    }
    return { id: q.id, label: q.label, hint: q.hint, ...meta }
  })

export const QUESTIONNAIRE_BUILDER: readonly BuilderSection[] = QUESTIONNAIRE.map(
  (section) => ({
    id: section.id,
    title: section.title,
    fields: buildFields(section),
  }),
)

export const TOTAL_BUILDER_FIELDS: number = QUESTIONNAIRE_BUILDER.reduce(
  (acc, s) => acc + s.fields.length,
  0,
)
