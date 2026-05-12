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
import type { AccessEntry } from '@/features/shares/access-entry'

export interface RevokeAccessDialogProps {
  open: boolean
  entry: AccessEntry | null
  onOpenChange: (open: boolean) => void
  onConfirm: (entry: AccessEntry) => void
}

export function RevokeAccessDialog({
  open,
  entry,
  onOpenChange,
  onConfirm,
}: RevokeAccessDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Révoquer l&apos;accès ?</AlertDialogTitle>
          <AlertDialogDescription>
            {entry?.email ?? ''} ne pourra plus consulter ce dossier. Cette
            action est immédiate.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (entry) onConfirm(entry)
            }}
          >
            Oui, révoquer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
