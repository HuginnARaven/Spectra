import { Button } from "@/components/ui/button";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks.ts";
import { Spinner } from "@/components/ui/spinner.tsx";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert.tsx";
import { sendForgotPassword } from "@/features/auth/authSlice.ts";
import { toast } from "sonner";

const formSchema = z.object({
    email: z.email({ message: "Invalid email address" }),
});

type FormValues = z.infer<typeof formSchema>;

export function RequestResetPasswordForm() {
    const dispatch = useAppDispatch();
    const { isLoading, error } = useAppSelector((state) => state.auth);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submittedEmail, setSubmittedEmail] = useState("");

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    });

    async function onSubmit(data: FormValues) {
        try {
            await dispatch(sendForgotPassword(data.email)).unwrap();
            setSubmittedEmail(data.email);
            setIsSubmitted(true);
            toast.success("Password reset email sent!");
        } catch (err) {
            console.error("Failed to send reset email:", err);
            toast.error(typeof err === "string" ? err : "Failed to send reset email");
        }
    }

    if (isSubmitted) {
        return (
            <div className="flex flex-col gap-6">
                <FieldGroup>
                    <div className="flex flex-col items-center gap-2 text-center">
                        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                            <CheckCircle2 className="size-6" />
                        </div>
                        <h1 className="text-2xl font-bold">Check your email</h1>
                        <p className="text-sm text-balance text-muted-foreground">
                            We have sent a password reset link to{" "}
                            <span className="font-medium text-foreground">{submittedEmail}</span>
                        </p>
                    </div>

                    <div className="rounded-lg border bg-muted/40 p-4 text-center text-sm text-muted-foreground">
                        Click the link in the email to reset your password. If you don&apos;t see it, check your spam or junk folder.
                    </div>

                    <Field>
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                                setIsSubmitted(false);
                                form.reset();
                            }}
                        >
                            Resend or try another email
                        </Button>
                    </Field>

                    <FieldDescription className="text-center">
                        Remember your password?{" "}
                        <Link to="/auth/login" className="underline underline-offset-4">
                            Back to login
                        </Link>
                    </FieldDescription>
                </FieldGroup>
            </div>
        );
    }

    return (
        <form
            id="request-reset-password-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
        >
            <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-2xl font-bold">Forgot password?</h1>
                    <p className="text-sm text-balance text-muted-foreground">
                        Enter your email below to receive a password reset link
                    </p>
                </div>

                <Controller
                    name="email"
                    control={form.control}
                    disabled={isLoading}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="email">Email</FieldLabel>
                            <Input
                                {...field}
                                id="email"
                                type="email"
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

                <Field>
                    <Button
                        type="submit"
                        form="request-reset-password-form"
                        disabled={isLoading}
                        className="w-full"
                    >
                        {!isLoading ? "Send reset link" : <Spinner />}
                    </Button>
                </Field>

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <FieldDescription
                    className="text-center"
                    style={isLoading ? { pointerEvents: "none", opacity: 0.5 } : {}}
                >
                    Remember your password?{" "}
                    <Link
                        to="/auth/login"
                        className="underline underline-offset-4"
                        onClick={() => form.reset()}
                    >
                        Back to login
                    </Link>
                </FieldDescription>
            </FieldGroup>
        </form>
    );
}

export default RequestResetPasswordForm;
