import { useParams } from 'react-router-dom'

export default function ShareDossierRoute() {
  const { token } = useParams<{ token: string }>()
  return (
    <>
      <title>Dossier partagé · Confluent</title>
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-3 bg-background px-6 py-12 text-center">
        <h1 className="font-heading text-2xl font-medium text-foreground">
          Dossier partagé
        </h1>
        <p className="text-sm text-muted-foreground">Token : {token}</p>
        <p className="text-xs text-muted-foreground">
          Vue dossier à venir dans la story 4.2.
        </p>
      </main>
    </>
  )
}
