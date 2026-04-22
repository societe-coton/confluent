import { Link } from 'react-router-dom'
import { LockIcon } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function AccessDeniedPage() {
  return (
    <>
      <title>Accès refusé — Confluent</title>
      <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col items-center justify-center gap-6 bg-background px-6 py-12 text-center">
        <LockIcon
          aria-hidden="true"
          className="size-12 text-muted-foreground"
        />
        <h1 className="font-heading text-2xl font-medium text-foreground sm:text-[28px]">
          Accès refusé
        </h1>
        <p className="text-sm text-muted-foreground">
          Ce lien est invalide ou a été révoqué. Si vous pensez qu&apos;il
          s&apos;agit d&apos;une erreur, contactez la personne qui vous a
          partagé ce lien.
        </p>
        <Link
          to="/"
          className={cn(
            buttonVariants({ variant: 'outline', size: 'lg' }),
            'w-full',
          )}
        >
          Retour à l&apos;accueil
        </Link>
      </main>
    </>
  )
}
