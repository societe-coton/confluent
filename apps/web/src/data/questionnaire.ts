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

// NOTE: French typography requires a narrow no-break space before `?`. Stored
// as literal U+00A0 in the label strings below and rendered as plain text
// nodes in JSX — no HTML entity decoding, no dangerouslySetInnerHTML.
export const QUESTIONNAIRE: readonly Section[] = [
  {
    id: 'presentation',
    title: 'Présentation',
    questions: [
      {
        id: 'nom-projet',
        label: 'Quel est le nom de votre projet\u00A0?',
        hint: 'Celui que vous préparez à partager avec des financeurs.',
      },
      {
        id: 'secteur',
        label: "Dans quel secteur d'activité évoluez-vous\u00A0?",
      },
      {
        id: 'maturite',
        label: 'À quel stade de maturité en êtes-vous\u00A0?',
        hint: 'Idée, prototype, premier client, levée engagée…',
      },
      {
        id: 'description-courte',
        label: 'Décrivez votre projet en une phrase.',
      },
    ],
  },
  {
    id: 'produit-marche',
    title: 'Produit & Marché',
    questions: [
      {
        id: 'probleme',
        label: 'Quel problème résolvez-vous\u00A0?',
      },
      {
        id: 'solution',
        label: 'Quelle est la solution que vous proposez\u00A0?',
      },
      {
        id: 'marche-cible',
        label: 'Qui sont vos utilisateurs ou clients cibles\u00A0?',
      },
      {
        id: 'differenciateur',
        label: "Qu'est-ce qui vous distingue de la concurrence\u00A0?",
      },
    ],
  },
  {
    id: 'finances-equipe',
    title: 'Finances & Équipe',
    questions: [
      {
        id: 'montant',
        label: 'Quel montant recherchez-vous\u00A0?',
        hint: 'En euros, une fourchette ou un chiffre rond suffit.',
      },
      {
        id: 'usage-fonds',
        label: 'À quoi ces fonds seront-ils alloués\u00A0?',
      },
      {
        id: 'taille-equipe',
        label: "Combien êtes-vous dans l'équipe aujourd'hui\u00A0?",
      },
      {
        id: 'profil-fondateur',
        label: 'Quel est votre parcours en quelques mots\u00A0?',
      },
    ],
  },
]

export const QUESTIONNAIRE_FLAT: readonly QuestionMeta[] = QUESTIONNAIRE.reduce<
  QuestionMeta[]
>((acc, section, sectionIdx) => {
  section.questions.forEach((question, qIdx) => {
    acc.push({
      ...question,
      sectionId: section.id,
      sectionTitle: section.title,
      sectionIndex: sectionIdx + 1,
      positionInSection: qIdx + 1,
      globalIndex: acc.length + 1,
    })
  })
  return acc
}, [])

export const TOTAL_QUESTIONS = QUESTIONNAIRE_FLAT.length
