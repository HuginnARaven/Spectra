import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldLegend, FieldSeparator,
    FieldSet
} from "@/components/ui/field.tsx";
import {InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput} from "@/components/ui/input-group.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Alert, AlertDescription} from "@/components/ui/alert.tsx";
import {SheetClose, SheetFooter} from "@/components/ui/sheet.tsx";
import {Spinner} from "@/components/ui/spinner.tsx";
import {changePassword} from "@/features/account/accountSlice.ts";
import * as z from "zod"
import {useState} from "react";
import {Controller, useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {useAppDispatch, useAppSelector} from "@/app/hooks.ts";
import { toast } from "sonner";
import {EyeOffIcon, EyeIcon, AlertCircle} from "lucide-react";
import { Link }  from "react-router-dom";

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


export function PasswordChangeForm(props: { isOpen: boolean, setOpen: (value: boolean) => void, changePasswordFromState: (value: "change" | "set") => void}) {
    const dispatch = useAppDispatch();
    const { isLoading, error } = useAppSelector((state) => state.account);
    const [hideCurrentPassword, setHideCurrentPassword] = useState(true);
    const [hideNewPassword, setHideNewPassword] = useState(true);
    
    const passwordForm = useForm<z.infer<typeof passwordChangeForm>>({
        resolver: zodResolver(passwordChangeForm),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmNewPassword: "",
        },
    })

    async function onPasswordChangeSubmit(data: z.infer<typeof passwordChangeForm>) {
        try {
            await dispatch(changePassword(data)).unwrap();
            toast.success("Password was changed successfully");
            props.setOpen(false);
            passwordForm.reset();
        } catch (err) {
            console.error("Password change failed:", err);
            toast.error(err as string);
        }
    }
    
    function handleChangePasswordFromState(){
        passwordForm.reset();
        props.changePasswordFromState("set");
    }
    
    return (
        <form id="password-change-form"
              onSubmit={passwordForm.handleSubmit(onPasswordChangeSubmit)}
              className="flex flex-col px-4 h-full">
            <FieldSet className="mt-4">
                <FieldLegend>Password Change Form</FieldLegend>
                <FieldDescription>
                    Change your password here
                </FieldDescription>
                <FieldGroup>
                    <Controller
                        name="currentPassword"
                        control={passwordForm.control}
                        disabled={isLoading}
                        render={({field, fieldState}) => (
                            <Field data-invalid={fieldState.invalid}>
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
                <FieldSeparator className={"mt-4 mb-4"}>Does not have password?</FieldSeparator>
                <Field>
                    <FieldLabel>
                        Set it here
                    </FieldLabel>
                    <Button variant="outline" type="button" onClick={handleChangePasswordFromState}>Set password from</Button>
                    <FieldDescription>
                        Or set it via "
                        <Link to="" className="ml-auto text-sm underline-offset-4 hover:underline" style={isLoading ? { pointerEvents: "none", opacity: 0.5 } : {}}>
                            Forgot your password?
                        </Link>
                        " email.
                    </FieldDescription>
                </Field>
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
    );
}