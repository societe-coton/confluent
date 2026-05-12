export interface Question {
  readonly id: string
  readonly label: string
  readonly hint?: string
}

export interface Section {
  readonly id: string
  readonly title: string
  readonly questions: readonly Question[]
}

export interface QuestionMeta extends Question {
  readonly sectionId: string
  readonly sectionTitle: string
  readonly sectionIndex: number
  readonly positionInSection: number
  readonly globalIndex: number
}
