import {Trash2Icon} from "lucide-react"

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
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {Button} from "@/components/ui/button"
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {useAppDispatch} from "@/app/hooks.ts";
import {deleteAdminUser} from "@/features/admin/adminSlice.ts";
import { toast } from "sonner";

type DeleteUserAlertDialogProps = {
    userId: string
    userName: string
}

export function DeleteUserAlertDialog(props: DeleteUserAlertDialogProps) {
    const dispatch = useAppDispatch()
    
    const handleDeleteUser = async () =>{
        try {
            await dispatch(deleteAdminUser(props.userId)).unwrap();
            toast.success("User deleted successfully");
        } catch (error: any) {
            toast.error(error || "Failed to delete URL");
        }
    }
    
    return (
        <AlertDialog>
            <Tooltip>
                <TooltipTrigger asChild>
                    <AlertDialogTrigger asChild>
                        <Button variant='ghost' size='icon' aria-label='Delete user'>
                            <Trash2Icon className='size-4.5'/>
                        </Button>
                    </AlertDialogTrigger>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Delete</p>
                </TooltipContent>
            </Tooltip>
            <AlertDialogContent size="sm">
                <AlertDialogHeader>
                    <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                        <Trash2Icon/>
                    </AlertDialogMedia>
                    <AlertDialogTitle>Delete user {props.userName} ?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete this user data. This action cannot be undone. User`s subscription
                        will be canceled automatically.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" onClick={handleDeleteUser}>Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
