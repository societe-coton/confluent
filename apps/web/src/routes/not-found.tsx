import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'

export default function NotFoundRoute() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 py-12 text-center">
      <title>404 · Confluent</title>
      <h1 className="text-5xl font-heading font-medium">404</h1>
      <p className="text-muted-foreground">Cette page n'existe pas.</p>
      <Link to="/dashboard" className={buttonVariants()}>
        Retour au tableau de bord
      </Link>
    </div>
  )
}
