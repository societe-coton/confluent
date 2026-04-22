import { useEffect, useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import type { UserRole } from '@confluent/shared'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useCurrentUser } from '@/features/current-user/context'
import { MOCK_USERS, type MockUser, type UserStatus } from '@/data/mock-users'
import { cn } from '@/lib/utils'

const inviteFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "L'adresse email est requise.")
    .email("Format d'email invalide.")
    .toLowerCase(),
  role: z.enum(['entrepreneur', 'financeur']),
})
type InviteFormValues = z.infer<typeof inviteFormSchema>

export default function AdminUtilisateursRoute() {
  const user = useCurrentUser()
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return <AdminUtilisateursList />
}

function AdminUtilisateursList() {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const [users, setUsers] = useState<MockUser[]>(() => [...MOCK_USERS])
  const [sheetOpen, setSheetOpen] = useState(false)
  const [deactivateTarget, setDeactivateTarget] = useState<MockUser | null>(
    null,
  )

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    mode: 'onSubmit',
    defaultValues: { email: '', role: 'entrepreneur' },
  })

  const onSubmitInvite = handleSubmit(({ email, role }) => {
    if (users.some((u) => u.email === email)) {
      setError('email', {
        type: 'duplicate',
        message: 'Cette adresse est déjà utilisée.',
      })
      return
    }
    const newUser: MockUser = {
      id: `user-invited-${email}`,
      email,
      role,
      status: 'inactive',
    }
    setUsers((prev) => [newUser, ...prev])
    setSheetOpen(false)
    reset()
    toast.success(`Invitation envoyée à ${email}`)
  })

  const handleSheetOpenChange = (open: boolean) => {
    setSheetOpen(open)
    if (!open) reset()
  }

  const handleConfirmDeactivate = () => {
    if (!deactivateTarget) return
    setUsers((prev) =>
      prev.map((u) =>
        u.id === deactivateTarget.id ? { ...u, status: 'inactive' } : u,
      ),
    )
    toast.success('Compte désactivé.')
    setDeactivateTarget(null)
  }

  return (
    <>
      <title>Utilisateurs · Confluent</title>

      <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
        <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="font-heading text-2xl font-semibold text-foreground md:text-[28px] focus-visible:outline-none"
          >
            Utilisateurs
          </h1>
          <SheetTrigger
            render={
              <Button type="button" variant="default" size="sm">
                Inviter un utilisateur
              </Button>
            }
          />
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          Gérez les comptes et les invitations de la plateforme.
        </p>

        <ul
          role="list"
          aria-label="Liste des utilisateurs de la plateforme"
          className="mt-8 flex flex-col gap-3 md:hidden"
        >
          {users.map((u) => (
            <li
              key={u.id}
              className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4"
            >
              <span className="break-all text-base font-medium text-foreground">
                {u.email}
              </span>
              <div className="flex items-center gap-2">
                <UserRoleBadge role={u.role} />
                <UserStatusIndicator status={u.status} />
              </div>
              {u.status === 'active' && u.role !== 'admin' && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2 self-end"
                  onClick={() => setDeactivateTarget(u)}
                >
                  Désactiver
                </Button>
              )}
            </li>
          ))}
        </ul>

        <div className="mt-8 hidden overflow-hidden rounded-lg border border-border bg-card md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th scope="col" className="px-4 py-3 font-medium">
                  Email
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Rôle
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Statut
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {u.email}
                  </td>
                  <td className="px-4 py-3">
                    <UserRoleBadge role={u.role} />
                  </td>
                  <td className="px-4 py-3">
                    <UserStatusIndicator status={u.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.status === 'active' && u.role !== 'admin' && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setDeactivateTarget(u)}
                      >
                        Désactiver
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <SheetContent className="w-[320px] duration-150 sm:max-w-[320px]">
          <SheetHeader>
            <SheetTitle>Inviter un utilisateur</SheetTitle>
            <SheetDescription>
              Envoyez un lien d&apos;invitation à une nouvelle adresse email. Le
              compte sera créé au statut «&nbsp;Inactif&nbsp;» jusqu&apos;à
              activation.
            </SheetDescription>
          </SheetHeader>

          <Separator />

          <form onSubmit={onSubmitInvite} noValidate>
            <div className="flex flex-col gap-3 px-4 py-3">
              <Label htmlFor="invite-email">Adresse email</Label>
              <Input
                id="invite-email"
                type="email"
                autoFocus
                autoComplete="email"
                placeholder="nom@entreprise.fr"
                aria-required="true"
                aria-invalid={errors.email ? 'true' : undefined}
                aria-describedby={
                  errors.email ? 'invite-email-error' : undefined
                }
                {...register('email')}
              />
              <div
                aria-live="assertive"
                aria-atomic="true"
                className="min-h-[1em]"
              >
                {errors.email && (
                  <p id="invite-email-error" className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <fieldset className="flex flex-col gap-2 px-4 py-3">
              <legend className="text-sm font-medium">Rôle</legend>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  value="entrepreneur"
                  className="size-4 accent-primary"
                  {...register('role')}
                />
                Entrepreneur
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  value="financeur"
                  className="size-4 accent-primary"
                  {...register('role')}
                />
                Financeur
              </label>
            </fieldset>

            <SheetFooter className="flex-col gap-2 p-4 sm:flex-row-reverse sm:justify-start">
              <Button type="submit" size="lg">
                Envoyer l&apos;invitation
              </Button>
              <SheetClose
                render={<Button type="button" variant="outline" size="lg" />}
              >
                Annuler
              </SheetClose>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <DeactivateUserDialog
        user={deactivateTarget}
        onOpenChange={(open) => {
          if (!open) setDeactivateTarget(null)
        }}
        onConfirm={handleConfirmDeactivate}
      />
    </>
  )
}

function UserStatusIndicator({ status }: { status: UserStatus }) {
  const label = status === 'active' ? 'Actif' : 'Inactif'
  const dotClass =
    status === 'active'
      ? 'bg-[var(--status-active)]'
      : 'bg-[var(--status-neutral)]'
  return (
    <span
      aria-label={`Statut : ${label}`}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground"
    >
      <span
        aria-hidden="true"
        className={cn('inline-block size-[7px] rounded-full', dotClass)}
      />
      {label}
    </span>
  )
}

function UserRoleBadge({ role }: { role: UserRole }) {
  if (role === 'admin') {
    return (
      <Badge variant="default" className="shrink-0">
        Admin
      </Badge>
    )
  }
  const label = role === 'entrepreneur' ? 'Entrepreneur' : 'Financeur'
  return (
    <Badge variant="secondary" className="shrink-0">
      {label}
    </Badge>
  )
}

function DeactivateUserDialog({
  user,
  onOpenChange,
  onConfirm,
}: {
  user: MockUser | null
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}) {
  return (
    <AlertDialog open={user !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Désactiver ce compte ?</AlertDialogTitle>
          <AlertDialogDescription>
            {user?.email ?? ''} ne pourra plus accéder à la plateforme
            jusqu&apos;à réactivation.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Oui, désactiver
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
