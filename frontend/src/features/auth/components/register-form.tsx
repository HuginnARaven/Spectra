import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button"
import {
    Field,
    FieldDescription, FieldError,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import * as z from "zod"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link }  from "react-router-dom";
import {Progress} from "@/components/ui/progress.tsx";
import {registerUser} from "@/features/auth/authSlice.ts";
import {useAppDispatch, useAppSelector} from "@/app/hooks.ts";
import {InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput} from "@/components/ui/input-group.tsx";
import { EyeOffIcon, EyeIcon, AlertCircle } from "lucide-react";
import {Spinner} from "@/components/ui/spinner.tsx";
import {Alert, AlertDescription} from "@/components/ui/alert.tsx";

const formSchema = z.object({
    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(100, "Username must be at most 100 characters."),
    email: z
        .email({ message: "Invalid email address" }),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters.")
        .max(100, "Password must be at most 100 characters.")
        .regex(/[a-zA-Z]/, "Password must contain at least one letter.")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character."),
    confirmPassword: z
        .string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

function getPasswordStrength(pass: string): number {
    if (!pass) return 0;

    const letters = (pass.match(/[a-zA-Z]/g) || []).length;
    const numbers = (pass.match(/[0-9]/g) || []).length;
    const specials = (pass.match(/[^a-zA-Z0-9]/g) || []).length;

    if (pass.length >= 15 && letters >= 3 && numbers >= 3 && specials >= 2) {
        return 3;
    }

    if (pass.length >= 6 && letters >= 1 && numbers >= 1 && specials >= 1) {
        return 2;
    }

    return 1;
}

export function RegisterForm() {
    const [hidePasswords, setHidePasswords] = useState(true);
    const dispatch = useAppDispatch();
    const { isLoading, error } = useAppSelector((state) => state.auth);
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    })
    
    const passwordValue = form.watch("password") || "";
    const strength = useMemo(() => getPasswordStrength(passwordValue), [passwordValue]);

    async function onSubmit(data: z.infer<typeof formSchema>) {
        try {
            const { confirmPassword, ...submitData } = data;
            await dispatch(registerUser(submitData)).unwrap();
        } catch (err) {
            console.error("Login failed:", err);
        }
    }
    
    return (
        <form id="register-form" onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-2xl font-bold">Create your account</h1>
                    <p className="text-sm text-balance text-muted-foreground">
                        Fill in the form below to create your account
                    </p>
                </div>
                <Controller
                    name="username"
                    control={form.control}
                    disabled={isLoading}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="username">
                                Username
                            </FieldLabel>
                            <Input
                                {...field}
                                id="username"
                                aria-invalid={fieldState.invalid}
                                placeholder="Spectr"
                                type="text"
                                required
                            />
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                        </Field>
                    )}
                />
                <Controller
                    name="email"
                    control={form.control}
                    disabled={isLoading}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="email">
                                Email
                            </FieldLabel>
                            <Input
                                {...field}
                                id="email"
                                aria-invalid={fieldState.invalid}
                                placeholder="spectr@example.com"
                                required
                            />
                            <FieldDescription>
                                We&apos;ll use this to contact you. We will not share your email
                                with anyone else.
                            </FieldDescription>
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                        </Field>
                    )}
                />
                <Controller
                    name="password"
                    control={form.control}
                    disabled={isLoading}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="password">
                                Password
                            </FieldLabel>
                            <InputGroup>
                                <InputGroupInput
                                    {...field}
                                    id="password"
                                    type={hidePasswords ? "password" : "text"}
                                    placeholder="Enter password"
                                />
                                <InputGroupAddon align="inline-end">
                                    <InputGroupButton type="button" disabled={isLoading} size="icon-xs" className="ml-auto" onClick={() => setHidePasswords(!hidePasswords)}>
                                        {hidePasswords ? <EyeOffIcon /> : <EyeIcon />}
                                    </InputGroupButton>
                                </InputGroupAddon>
                            </InputGroup>
                            {passwordValue.length > 0 && (<Progress value={strength / 3 * 100}/>)}
                            <FieldDescription>
                                {strength === 0 && "Must be at least 6 characters long."}
                                {strength === 1 && "Weak: Add characters on special symbols"}
                                {strength === 2 && "Good: Meets basic requirements"}
                                {strength === 3 && "Strong!"}
                            </FieldDescription>
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                        </Field>
                    )}
                />
                <Controller
                    name="confirmPassword"
                    control={form.control}
                    disabled={isLoading}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="confirmPassword">
                                Confirm Password
                            </FieldLabel>
                            <Input
                                {...field}
                                id="confirmPassword"
                                aria-invalid={fieldState.invalid}
                                type={hidePasswords ? "password" : "text"}
                                placeholder="Enter password one more time"
                                required
                            />
                            <FieldDescription>
                                Please confirm your password.
                            </FieldDescription>
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                        </Field>
                    )}
                />
                <Field>
                    <Button type="submit" form="register-form" disabled={isLoading}>Create Account {isLoading && <Spinner />}</Button>
                </Field>
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                <FieldSeparator>Or continue with</FieldSeparator>
                <Field>
                    <Button variant="outline" disabled={isLoading} type="button" onClick={() => form.reset()}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path
                                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                                fill="currentColor"
                            />
                        </svg>
                        <span>Sign up with Google</span>
                    </Button>
                    <FieldDescription className="text-center" style={isLoading ? { pointerEvents: "none", opacity: 0.5 } : {}}>
                        Already have an account?{" "}
                        <Link to="/auth/login" className="underline underline-offset-4" onClick={() => form.reset()}>
                            Sign in
                        </Link>
                    </FieldDescription>
                </Field>
            </FieldGroup>
        </form>
    )
}
