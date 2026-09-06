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
import {AlertCircle} from "lucide-react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";
import * as z from "zod"
import {Controller, useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {useAppDispatch, useAppSelector} from "@/app/hooks.ts";
import {clearErrors, editUser, sendEmailVerification} from "@/features/account/accountSlice.ts";
import { toast } from "sonner";
import {Spinner} from "@/components/ui/spinner.tsx";
import {Alert, AlertDescription} from "@/components/ui/alert.tsx";
import {PasswordChangeForm} from "@/features/account/components/password-change-from.tsx";
import {PasswordSetForm} from "@/features/account/components/password-set-from.tsx";
import {ButtonGroup} from "@/components/ui/button-group.tsx";
import {InputGroup, InputGroupAddon, InputGroupInput} from "@/components/ui/input-group.tsx";
import {BadgeCheck, BadgeAlert} from "lucide-react";

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

export function AccountEditForm(props: { isOpen: boolean, setOpen: (value: boolean) => void} ) {
    const dispatch = useAppDispatch();
    const { user, isLoading, error } = useAppSelector((state) => state.account);
    const [passwordFromState, changePasswordFromState] = useState<"change" | "set">("change");
    
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

    async function handleEmailVerificationButtonClick(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault()
        try {
            await dispatch(sendEmailVerification()).unwrap();
            toast.success("Email sent successfully. Check your inbox.");
        } catch (error: unknown) {
            toast.error(`Error sending email verification Letter: ${error}`);
        } finally {
            props.setOpen(false);
        }
    }

    const handleOpenChange = (isOpen: boolean) => {
        props.setOpen(isOpen);
        profileForm.reset();
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
                                                <ButtonGroup>
                                                    <InputGroup>
                                                        <InputGroupInput
                                                            {...field}
                                                            id="email"
                                                            aria-invalid={fieldState.invalid}
                                                            placeholder="Enter your email"
                                                            required
                                                        />
                                                        <InputGroupAddon align="inline-end" color="green" hidden={!user!.emailConfirmed || fieldState.isDirty}>
                                                            <div className="text-green-700  dark:text-green-300">
                                                                Verified
                                                            </div>
                                                            <BadgeCheck color="green"/>
                                                        </InputGroupAddon>
                                                    </InputGroup>
                                                    {!user!.emailConfirmed && !fieldState.isDirty ? 
                                                        <Button 
                                                            variant="outline" 
                                                            onClick={handleEmailVerificationButtonClick}>
                                                            Verify 
                                                            <BadgeAlert/>
                                                        </Button> 
                                                        : null}
                                                </ButtonGroup>
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
                        {passwordFromState === "change" ? <PasswordChangeForm {...props} changePasswordFromState={changePasswordFromState}/> : <PasswordSetForm {...props} changePasswordFromState={changePasswordFromState}/>}
                    </TabsContent>
                </Tabs>
            </SheetContent>
        </Sheet>
    )
}
