import { Navigate } from 'react-router-dom'

const DRAFT_NAME_KEY = 'confluent_draft_name'

export default function QuestionnaireRoute() {
  if (!localStorage.getItem(DRAFT_NAME_KEY)) {
    return <Navigate to="/dashboard/dossiers/nouveau" replace />
  }

  return (
    <>
      <title>Questionnaire · Confluent</title>
      <h1 className="font-heading text-2xl font-medium">Questionnaire</h1>
    </>
  )
}
