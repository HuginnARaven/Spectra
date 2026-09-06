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
import {setPassword} from "@/features/account/accountSlice.ts";
import * as z from "zod"
import {useState} from "react";
import {Controller, useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {useAppDispatch, useAppSelector} from "@/app/hooks.ts";
import { toast } from "sonner";
import {EyeOffIcon, EyeIcon, AlertCircle} from "lucide-react";
import { Link }  from "react-router-dom";

const passwordSetForm = z.object({
    password: z
        .string()
        .min(6, "Password must be at least 6 characters.")
        .max(100, "Password must be at most 100 characters.")
        .regex(/[a-zA-Z]/, "Password must contain at least one letter.")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character."),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});


export function PasswordSetForm(props: { isOpen: boolean, setOpen: (value: boolean) => void, changePasswordFromState: (value: "change" | "set") => void} ) {
    const dispatch = useAppDispatch();
    const { isLoading, error } = useAppSelector((state) => state.account);
    const [hidePassword, setHidePassword] = useState(true);
    
    const setPasswordForm = useForm<z.infer<typeof passwordSetForm>>({
        resolver: zodResolver(passwordSetForm),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    })

    async function onPasswordSetSubmit(data: z.infer<typeof passwordSetForm>) {
        try {
            await dispatch(setPassword(data)).unwrap();
            toast.success("Password was set successfully");
            props.setOpen(false);
            setPasswordForm.reset();
        } catch (err) {
            console.error("Password change failed:", err);
            toast.error(err as string);
        }
    }
    
    function handleChangePasswordFromState(){
        setPasswordForm.reset();
        props.changePasswordFromState("change");
    }
    
    return (
        <form id="password-change-form"
              onSubmit={setPasswordForm.handleSubmit(onPasswordSetSubmit)}
              className="flex flex-col px-4 h-full">
            <FieldSet className="mt-4">
                <FieldLegend>Password Set Form</FieldLegend>
                <FieldDescription>
                    Set your password here
                </FieldDescription>
                <FieldGroup>
                    <Controller
                        name="password"
                        control={setPasswordForm.control}
                        disabled={isLoading}
                        render={({field, fieldState}) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="password">
                                    Password
                                </FieldLabel>
                                <InputGroup>
                                    <InputGroupInput
                                        {...field}
                                        id="password"
                                        type={hidePassword ? "password" : "text"}
                                        placeholder="Enter password"
                                    />
                                    <InputGroupAddon align="inline-end">
                                        <InputGroupButton type="button" size="icon-xs"
                                                          className="ml-auto"
                                                          onClick={() => setHidePassword(!hidePassword)}>
                                            {hidePassword ? <EyeOffIcon/> : <EyeIcon/>}
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
                        name="confirmPassword"
                        control={setPasswordForm.control}
                        disabled={isLoading}
                        render={({field, fieldState}) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="confirmPassword">
                                    Confirm new password
                                </FieldLabel>
                                <Input
                                    {...field}
                                    id="confirmPassword"
                                    aria-invalid={fieldState.invalid}
                                    type={hidePassword ? "password" : "text"}
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
                <FieldSeparator className={"mt-4 mb-4"}>Already have password?</FieldSeparator>
                <Field>
                    <FieldLabel>
                        Change it here
                    </FieldLabel>
                    <Button variant="outline" type="button" onClick={handleChangePasswordFromState}>Change password from</Button>
                    <FieldDescription>
                        Or change it via "
                        <Link to="/auth/forgot-password" className="ml-auto text-sm underline-offset-4 hover:underline" style={isLoading ? { pointerEvents: "none", opacity: 0.5 } : {}}>
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
                <Button type="submit" form="password-change-form" disabled={!setPasswordForm.formState.isDirty || isLoading}>{!setPasswordForm.formState.isDirty ? "Do some changes to save" : "Save changes"}{isLoading && <Spinner />}</Button>
                <SheetClose asChild>
                    <Button variant="outline">Close</Button>
                </SheetClose>
            </SheetFooter>
        </form>
    );
}