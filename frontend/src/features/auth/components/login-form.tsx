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
import {useAppDispatch, useAppSelector} from "@/app/hooks.ts";
import {loginUser, loginUserViaGoogle} from "@/features/auth/authSlice.ts";
import {Spinner} from "@/components/ui/spinner.tsx";
import {InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput} from "@/components/ui/input-group.tsx";
import { EyeOffIcon, EyeIcon, AlertCircle } from "lucide-react";
import { useState } from "react"
import {Alert, AlertDescription} from "@/components/ui/alert.tsx";
import { useGoogleLogin } from '@react-oauth/google';
import type {GoogleAuthRequest} from "@/features/auth/types.ts";
import { toast } from "sonner";

const formSchema = z.object({
    email: z
        .email({ message: "Invalid email address" }),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .max(100, "Password must be at most 100 characters."),
})

export function LoginForm() {
    const [hidePassword, setHidePassword] = useState(true);
    const dispatch = useAppDispatch();
    const { isLoading, error } = useAppSelector((state) => state.auth);
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })
    
    const googleLogin = useGoogleLogin({
        flow: 'auth-code',
        onSuccess: async (codeResponse) => {
            const data: GoogleAuthRequest = {code: codeResponse.code}
            await dispatch(loginUserViaGoogle(data)).unwrap();
            toast.info("You may not have a password yet. Set it in account settings.")
        },
        onError: errorResponse => toast.error(errorResponse.error),
    });

    async function onSubmit(data: z.infer<typeof formSchema>) {
        try {
            await dispatch(loginUser(data)).unwrap();
        } catch (err) {
            console.error("Login failed:", err);
        }
    }
    
    return (
        <form id="login-form" onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-2xl font-bold">Welcome back</h1>
                    <p className="text-sm text-balance text-muted-foreground">
                        Enter your email below to login to your account
                    </p>
                </div>
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
                            <div className="flex items-center">
                                <FieldLabel htmlFor="password">
                                    Password
                                </FieldLabel>
                                <Link to="" className="ml-auto text-sm underline-offset-4 hover:underline" style={isLoading ? { pointerEvents: "none", opacity: 0.5 } : {}}>
                                    Forgot your password?
                                </Link>
                            </div>
                            <InputGroup>
                                <InputGroupInput
                                    {...field}
                                    id="password"
                                    type={hidePassword ? "password" : "text"}
                                    placeholder="Enter password"
                                />
                                <InputGroupAddon align="inline-end">
                                    <InputGroupButton type="button" disabled={isLoading} size="icon-xs" className="ml-auto" onClick={() => setHidePassword(!hidePassword)}>
                                        {hidePassword ? <EyeOffIcon /> : <EyeIcon />}
                                    </InputGroupButton>
                                </InputGroupAddon>
                            </InputGroup>
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                        </Field>
                    )}
                />
                <Field>
                    <Button type="submit" form="login-form" disabled={isLoading}>{!isLoading? "Login": <Spinner/>}</Button>
                </Field>
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                <FieldSeparator>Or continue with</FieldSeparator>
                <Field>
                    <Button variant="outline" disabled={isLoading} type="button" onClick={googleLogin}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path
                                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                                fill="currentColor"
                            />
                        </svg>
                        <span>Login with Google</span>
                    </Button>
                    <FieldDescription className="text-center" style={isLoading ? { pointerEvents: "none", opacity: 0.5 } : {}}>
                        Don&apos;t have an account?{" "}
                        <Link to="/auth/register" className="underline underline-offset-4" onClick={() => form.reset()}>
                            Sign up
                        </Link>
                    </FieldDescription>
                </Field>
            </FieldGroup>
        </form>
    )
}
