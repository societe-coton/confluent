import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useState } from 'react'
import { StatusDot } from '@/components/confluent/StatusDot'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { AccessEntry } from '@/features/shares/access-entry'

const shareFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "L'adresse email est requise.")
    .email("Format d'email invalide.")
    .toLowerCase(),
})
type ShareFormValues = z.infer<typeof shareFormSchema>

export interface SharePanelProps {
  existingEntries: readonly AccessEntry[]
  onSubmitInvitation: (email: string) => Promise<void>
}

export function SharePanel({
  existingEntries,
  onSubmitInvitation,
}: SharePanelProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ShareFormValues>({
    resolver: zodResolver(shareFormSchema),
    mode: 'onSubmit',
    defaultValues: { email: '' },
  })

  const onSubmit = handleSubmit(async ({ email }) => {
    if (
      existingEntries.some(
        (entry) => entry.email === email && entry.status !== 'revoked',
      )
    ) {
      setError('email', {
        type: 'duplicate',
        message: 'Cette adresse est déjà invitée.',
      })
      return
    }
    setIsSubmitting(true)
    try {
      await onSubmitInvitation(email)
      reset()
    } catch (err) {
      const message =
        typeof err === 'object' && err !== null && 'message' in err
          ? String((err as { message: unknown }).message)
          : "L'invitation a échoué. Réessayez."
      setError('email', { type: 'server', message })
    } finally {
      setIsSubmitting(false)
    }
  })

  return (
    <SheetContent className="w-[300px] duration-150 sm:max-w-[300px]">
      <SheetHeader>
        <SheetTitle>Partager le dossier</SheetTitle>
        <SheetDescription>
          Entrez l&apos;adresse email du destinataire pour lui envoyer une
          invitation d&apos;accès.
        </SheetDescription>
      </SheetHeader>

      <Separator />

      <form onSubmit={onSubmit} noValidate>
        <div className="flex flex-col gap-3 px-4 py-3">
          <Label htmlFor="share-email">Adresse email du destinataire</Label>
          <Input
            id="share-email"
            type="email"
            autoFocus
            autoComplete="email"
            placeholder="marc@fonds.fr"
            aria-required="true"
            aria-invalid={errors.email ? 'true' : undefined}
            aria-describedby={errors.email ? 'share-email-error' : undefined}
            {...register('email')}
          />
          <div
            aria-live="assertive"
            aria-atomic="true"
            className="min-h-[1em]"
          >
            {errors.email && (
              <p id="share-email-error" className="text-xs text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>
        </div>

        <SheetFooter className="flex-col gap-2 p-4 sm:flex-row-reverse sm:justify-start">
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Envoi…' : "Envoyer l'invitation"}
          </Button>
          <SheetClose
            render={<Button type="button" variant="outline" size="lg" />}
          >
            Annuler
          </SheetClose>
        </SheetFooter>
      </form>

      <Separator />

      <div className="flex flex-col gap-2 px-4 py-3">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Destinataires existants
        </p>
        {existingEntries.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Aucun destinataire pour le moment.
          </p>
        ) : (
          <ul role="list" className="m-0 flex list-none flex-col gap-1.5 p-0">
            {existingEntries.map((entry) => (
              <li
                key={entry.email}
                className="flex min-w-0 items-center gap-2"
              >
                <StatusDot status={entry.status} />
                <span
                  className="truncate text-sm text-foreground"
                  title={entry.email}
                >
                  {entry.email}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </SheetContent>
  )
}
