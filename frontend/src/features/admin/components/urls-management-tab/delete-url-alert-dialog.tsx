import { Trash2Icon } from 'lucide-react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useAppDispatch } from '@/app/hooks'
import { deleteAdminUrl } from '@/features/admin/adminSlice'
import { toast } from 'sonner'

export interface DeleteUrlAlertDialogProps {
    urlId: string
    shortCode: string
    isOpen: boolean
    setOpen: (value: boolean) => void
}

export function DeleteUrlAlertDialog({ urlId, shortCode, isOpen, setOpen }: DeleteUrlAlertDialogProps) {
    const dispatch = useAppDispatch()

    const handleDeleteUrl = async () => {
        try {
            await dispatch(deleteAdminUrl(urlId)).unwrap()
            toast.success('URL deleted successfully')
        } catch (error: any) {
            toast.error(error || 'Failed to delete URL')
        }
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={setOpen}>
            <AlertDialogContent size="sm">
                <AlertDialogHeader>
                    <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                        <Trash2Icon />
                    </AlertDialogMedia>
                    <AlertDialogTitle>Delete URL: {shortCode}?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete this shortened link. Visitors using this link will no longer be redirected. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" onClick={handleDeleteUrl}>
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
