import { useParams } from 'react-router-dom'

export default function ShareRoute() {
  const { token } = useParams<{ token: string }>()

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <title>Dossier partagé · Confluent</title>
      <h1 className="text-2xl font-heading font-medium">Dossier partagé</h1>
      <p className="mt-2 text-sm text-muted-foreground">Token : {token}</p>
    </div>
  )
}
