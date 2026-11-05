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
} from "@/components/ui/alert-dialog"
import {useAppDispatch} from "@/app/hooks.ts";
import {deleteAdminUser} from "@/features/admin/adminSlice.ts";
import { toast } from "sonner";

type DeleteUserAlertDialogProps = {
    userId: string;
    userName: string;
    isOpen: boolean;
    setOpen: (value: boolean) => void
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

    const handleOpenChange = (isOpen: boolean) => {
        props.setOpen(isOpen);
    };
    
    return (
        <AlertDialog open={props.isOpen} onOpenChange={handleOpenChange}>
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
