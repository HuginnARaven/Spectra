import {useState} from "react";
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSet
} from "@/components/ui/field.tsx";
import {InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput} from "@/components/ui/input-group.tsx";
import {EyeOffIcon, EyeIcon, AlertCircle} from "lucide-react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";
import * as z from "zod"
import {Controller, useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {useAppDispatch, useAppSelector} from "@/app/hooks.ts";
import {changePassword, clearErrors, editUser} from "@/features/account/accountSlice.ts";
import { toast } from "sonner";
import {Spinner} from "@/components/ui/spinner.tsx";
import {Alert, AlertDescription} from "@/components/ui/alert.tsx";

const profileFormSchema = z.object({
    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(100, "Username must be at most 100 characters."),
    email: z
        .email({message: "Invalid email address"}),
    displayName: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(100, "Username must be at most 100 characters."),
})

const passwordChangeForm = z.object({
    currentPassword: z.string().min(6, "Password must be at least 6 characters."),
    newPassword: z
        .string()
        .min(6, "Password must be at least 6 characters.")
        .max(100, "Password must be at most 100 characters.")
        .regex(/[a-zA-Z]/, "Password must contain at least one letter.")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character."),
    confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ["confirmNewPassword"],
});


export function AccountEditForm(props: { isOpen: boolean, setOpen: (value: boolean) => void} ) {
    const dispatch = useAppDispatch();
    const { user, isLoading, error } = useAppSelector((state) => state.account);
    const [hideCurrentPassword, setHideCurrentPassword] = useState(true);
    const [hideNewPassword, setHideNewPassword] = useState(true);

    const profileForm = useForm<z.infer<typeof profileFormSchema>>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            username: "",
            email: "",
            displayName: "",
        },
        values: {
            username: user?.username || "",
            email: user?.email  || "",
            displayName: user?.displayName || "",
        }
    })

    const passwordForm = useForm<z.infer<typeof passwordChangeForm>>({
        resolver: zodResolver(passwordChangeForm),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmNewPassword: "",
        },
    })

    async function onProfileEditSubmit(data: z.infer<typeof profileFormSchema>) {
        try {
            await dispatch(editUser(data)).unwrap();
            toast.success("Profile updated successfully");
            props.setOpen(false);
        } catch (err) {
            console.error("Profile edit failed:", err);
            toast.error(err as string);
        }
    }

    async function onPasswordChangeSubmit(data: z.infer<typeof passwordChangeForm>) {
        try {
            await dispatch(changePassword(data)).unwrap();
            toast.success("Password changed successfully");
            props.setOpen(false);
            passwordForm.reset();
        } catch (err) {
            console.error("Password change failed:", err);
            toast.error(err as string);
        }
    }

    const handleOpenChange = (isOpen: boolean) => {
        props.setOpen(isOpen);
        profileForm.reset();
        passwordForm.reset();
        dispatch(clearErrors());
    };

    return (
        <Sheet open={props.isOpen} onOpenChange={handleOpenChange}>
            <SheetContent className="flex flex-col w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>Edit account data</SheetTitle>
                </SheetHeader>
                <Tabs defaultValue="profile" className="flex flex-col flex-1">
                    <TabsList variant="line" className="grid w-full grid-cols-2">
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="password">Password</TabsTrigger>
                    </TabsList>
                    <TabsContent value="profile" className="flex-1 mt-0">
                        <form id="profile-edit-form" className="flex flex-col px-4 h-full"
                              onSubmit={profileForm.handleSubmit(onProfileEditSubmit)}>
                            <FieldSet className="mt-4">
                                <FieldLegend>Profile Edit Form</FieldLegend>
                                <FieldDescription>
                                    Enter your email below to login to your account
                                </FieldDescription>
                                <FieldGroup>
                                    <Controller
                                        name="username"
                                        control={profileForm.control}
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
                                                    placeholder="Enter your username"
                                                    type="text"
                                                    required
                                                />
                                                <FieldDescription>
                                                    This will be your public display name.
                                                </FieldDescription>
                                                {fieldState.invalid && (
                                                    <FieldError errors={[fieldState.error]}/>
                                                )}
                                            </Field>
                                        )}
                                    />
                                    <Controller
                                        name="email"
                                        control={profileForm.control}
                                        disabled={isLoading}
                                        render={({field, fieldState}) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor="email">
                                                    Email
                                                </FieldLabel>
                                                <Input
                                                    {...field}
                                                    id="email"
                                                    aria-invalid={fieldState.invalid}
                                                    placeholder="Enter your email"
                                                    required
                                                />
                                                <FieldDescription>
                                                    We'll never share your email with anyone else.
                                                </FieldDescription>
                                                {fieldState.invalid && (
                                                    <FieldError errors={[fieldState.error]}/>
                                                )}
                                            </Field>
                                        )}
                                    />
                                    <Controller
                                        name="displayName"
                                        control={profileForm.control}
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
                                                    placeholder="Enter your display name"
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
                                </FieldGroup>
                                {error && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}
                            </FieldSet>
                            <SheetFooter className="px-0">
                                <Button type="submit" form="profile-edit-form" disabled={!profileForm.formState.isDirty || isLoading}>{!profileForm.formState.isDirty ? "Do some changes to save" : "Save changes"}{isLoading && <Spinner />}</Button>
                                <SheetClose asChild>
                                    <Button variant="outline">Close</Button>
                                </SheetClose>
                            </SheetFooter>
                        </form>
                    </TabsContent>
                    <TabsContent value="password" className="flex-1 mt-0">
                        <form id="password-change-form"
                              onSubmit={passwordForm.handleSubmit(onPasswordChangeSubmit)}
                              className="flex flex-col px-4 h-full">
                            <FieldSet className="mt-4">
                                <FieldLegend>Password Change Form</FieldLegend>
                                <FieldDescription>
                                    Enter your email below to login to your account
                                </FieldDescription>
                                <FieldGroup>
                                    <Controller
                                        name="currentPassword"
                                        control={passwordForm.control}
                                        disabled={isLoading}
                                        render={({field, fieldState}) => (
                                            <Field>
                                                <FieldLabel htmlFor="current-password">
                                                    Current password
                                                </FieldLabel>
                                                <InputGroup>
                                                    <InputGroupInput
                                                        {...field}
                                                        id="currentPassword"
                                                        type={hideCurrentPassword ? "password" : "text"}
                                                        placeholder="Enter current password"
                                                    />
                                                    <InputGroupAddon align="inline-end">
                                                        <InputGroupButton type="button" size="icon-xs"
                                                                          className="ml-auto"
                                                                          onClick={() => setHideCurrentPassword(!hideCurrentPassword)}>
                                                            {hideCurrentPassword ? <EyeOffIcon/> : <EyeIcon/>}
                                                        </InputGroupButton>
                                                    </InputGroupAddon>
                                                </InputGroup>
                                                <FieldDescription>
                                                    Must be at least 6 characters long.
                                                </FieldDescription>
                                                {fieldState.invalid && (
                                                    <FieldError errors={[fieldState.error]}/>
                                                )}
                                            </Field>
                                        )}
                                    />
                                    <Controller
                                        name="newPassword"
                                        control={passwordForm.control}
                                        disabled={isLoading}
                                        render={({field, fieldState}) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor="new-password">
                                                    New password
                                                </FieldLabel>
                                                <InputGroup>
                                                    <InputGroupInput
                                                        {...field}
                                                        id="new-password"
                                                        type={hideNewPassword ? "password" : "text"}
                                                        placeholder="Enter new password"
                                                    />
                                                    <InputGroupAddon align="inline-end">
                                                        <InputGroupButton type="button" size="icon-xs"
                                                                          className="ml-auto"
                                                                          onClick={() => setHideNewPassword(!hideNewPassword)}>
                                                            {hideNewPassword ? <EyeOffIcon/> : <EyeIcon/>}
                                                        </InputGroupButton>
                                                    </InputGroupAddon>
                                                </InputGroup>
                                                <FieldDescription>
                                                    Must be at least 6 characters long.
                                                </FieldDescription>
                                                {fieldState.invalid && (
                                                    <FieldError errors={[fieldState.error]}/>
                                                )}
                                            </Field>
                                        )}
                                    />
                                    <Controller
                                        name="confirmNewPassword"
                                        control={passwordForm.control}
                                        disabled={isLoading}
                                        render={({field, fieldState}) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor="confirmNewPassword">
                                                    Confirm new password
                                                </FieldLabel>
                                                <Input
                                                    {...field}
                                                    id="confirmNewPassword"
                                                    aria-invalid={fieldState.invalid}
                                                    type={hideNewPassword ? "password" : "text"}
                                                    placeholder="Enter new password one more time"
                                                    required
                                                />
                                                <FieldDescription>
                                                    Please confirm your new password.
                                                </FieldDescription>
                                                {fieldState.invalid && (
                                                    <FieldError errors={[fieldState.error]}/>
                                                )}
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
                            </FieldSet>
                            <SheetFooter className="px-0">
                                <Button type="submit" form="password-change-form" disabled={!passwordForm.formState.isDirty || isLoading}>{!passwordForm.formState.isDirty ? "Do some changes to save" : "Save changes"}{isLoading && <Spinner />}</Button>
                                <SheetClose asChild>
                                    <Button variant="outline">Close</Button>
                                </SheetClose>
                            </SheetFooter>
                        </form>
                    </TabsContent>
                </Tabs>
            </SheetContent>
        </Sheet>
    )
}
