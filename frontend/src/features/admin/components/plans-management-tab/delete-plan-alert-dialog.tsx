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
import { deleteAdminSubscriptionPlan } from '@/features/admin/adminSlice'
import { toast } from 'sonner'

export interface DeletePlanAlertDialogProps {
    planId: string
    planName: string
    isOpen: boolean
    setOpen: (value: boolean) => void
}

export function DeletePlanAlertDialog({
    planId,
    planName,
    isOpen,
    setOpen,
}: DeletePlanAlertDialogProps) {
    const dispatch = useAppDispatch()

    const handleDeletePlan = async () => {
        try {
            await dispatch(deleteAdminSubscriptionPlan(planId)).unwrap()
            toast.success('Subscription plan deleted successfully')
        } catch (error) {
            toast.error(
                typeof error === 'string' ? error : 'Failed to delete subscription plan'
            )
        }
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={setOpen}>
            <AlertDialogContent size="sm">
                <AlertDialogHeader>
                    <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                        <Trash2Icon />
                    </AlertDialogMedia>
                    <AlertDialogTitle>Delete plan: {planName}?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete the subscription plan and remove it from Stripe. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" onClick={handleDeletePlan}>
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
