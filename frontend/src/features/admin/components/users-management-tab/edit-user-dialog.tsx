import {
    Dialog, DialogClose,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel} from "@/components/ui/field.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import type {AdminUserListItem} from "@/features/admin/types.ts";
import * as z from "zod"
import {useAppDispatch, useAppSelector} from "@/app/hooks.ts";
import {Controller, useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import { toast } from "sonner";
import {editAdminUser, clearErrors} from "@/features/admin/adminSlice.ts";
import {Alert, AlertDescription} from "@/components/ui/alert.tsx";
import {AlertCircle} from "lucide-react";


type UserInfoDialogProps = {
    user: AdminUserListItem;
    isOpen: boolean;
    setOpen: (value: boolean) => void
}

const userEditFormSchema = z.object({
    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(100, "Username must be at most 100 characters."),
    email: z
        .email({message: "Invalid email address"}),
    displayName: z
        .string()
        .min(3, "Display name must be at least 3 characters")
        .max(100, "Display name must be at most 100 characters."),
    emailConfirmed: z
        .boolean()
})

export function EditUserDialog(props: UserInfoDialogProps) {
    const dispatch = useAppDispatch();
    const { isLoading, error } = useAppSelector((state) => state.admin);

    const userEditForm = useForm<z.infer<typeof userEditFormSchema>>({
        resolver: zodResolver(userEditFormSchema),
        defaultValues: {
            username: "",
            email: "",
            displayName: "",
            emailConfirmed: false,
        },
        values: {
            username: props.user.userName || "",
            email: props.user.email  || "",
            displayName: props.user.displayName || "",
            emailConfirmed: props.user.emailConfirmed,
        }
    })

    async function onUserEditSubmit(data: z.infer<typeof userEditFormSchema>) {
        try {
            await dispatch(editAdminUser({id: props.user.id, data})).unwrap();
            toast.success("User updated successfully");
            props.setOpen(false);
        } catch (err) {
            console.error("User edit failed:", err);
            toast.error(err as string);
        }
    }
    
    const handleOpenChange = (isOpen: boolean) => {
        props.setOpen(isOpen);
        userEditForm.reset();
        dispatch(clearErrors());
    };
    
    
    return (
        <Dialog open={props.isOpen} onOpenChange={handleOpenChange}>
            <form id={`user-${props.user.id}-edit-form`} onSubmit={userEditForm.handleSubmit(onUserEditSubmit)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{props.user.userName} info</DialogTitle>
                        <DialogDescription>
                            Make changes to user&apos;s profile here. Click save when you&apos;re done.
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Controller
                            name="username"
                            control={userEditForm.control}
                            disabled={isLoading}
                            render={({field, fieldState}) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="username">
                                        Username
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="username"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Enter username"
                                        type="text"
                                        required
                                    />
                                    <FieldDescription>
                                        This will be account name.
                                    </FieldDescription>
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]}/>
                                    )}
                                </Field>
                            )}
                        />
                        <Controller
                            name="displayName"
                            control={userEditForm.control}
                            disabled={isLoading}
                            render={({field, fieldState}) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="displayName">
                                        Display Name
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="displayName"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Enter display name"
                                        type="text"
                                        required
                                    />
                                    <FieldDescription>
                                        This is the name that will be displayed to other users.
                                    </FieldDescription>
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]}/>
                                    )}
                                </Field>
                            )}
                        />
                        <Controller
                        name="email"
                        control={userEditForm.control}
                        disabled={isLoading}
                        render={({field, fieldState}) => (
                                <Field>
                                    <FieldLabel htmlFor="email">
                                        Email
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="email"
                                        placeholder="Enter email"
                                        type="email"
                                        required
                                        onChange={(e) => {
                                            const newEmail = e.target.value;
                                            field.onChange(e);

                                            if (newEmail !== props.user.email) {
                                                userEditForm.setValue("emailConfirmed", false, { shouldDirty: true });
                                            } else {
                                                userEditForm.setValue("emailConfirmed", props.user.emailConfirmed, { shouldDirty: true });
                                            }
                                        }}
                                    />
                                    <FieldDescription>
                                        Note user&apos;s email varification will be set to false
                                    </FieldDescription>
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]}/>
                                    )}
                                </Field>
                            )}
                        />
                        <Controller
                            name="emailConfirmed"
                            control={userEditForm.control}
                            disabled={isLoading}
                            render={({ field, fieldState }) => (
                                <Field orientation="horizontal">
                                    <Checkbox
                                        id="emailConfirmed"
                                        name={field.name}
                                        ref={field.ref}
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        onBlur={field.onBlur}
                                        disabled={field.disabled}
                                    />
                                    <FieldContent>
                                        <FieldLabel htmlFor="emailConfirmed">
                                            Email Verification
                                        </FieldLabel>
                                        <FieldDescription>
                                            By clicking this checkbox, you are changing user&apos;s verification status
                                        </FieldDescription>
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </FieldContent>
                                </Field>
                            )}
                        />

                    </FieldGroup>
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" form={`user-${props.user.id}-edit-form`}>Save changes</Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}
