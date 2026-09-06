import { useState } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from '@/components/ui/card';
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from '@/components/ui/input-group';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import {
    KeyRound,
    CheckCircle2,
    XCircle,
    AlertCircle,
    EyeIcon,
    EyeOffIcon,
    LogIn,
    Home,
    Pyramid,
    Mail,
} from 'lucide-react';
import authApi from '@/features/auth/authApi';
import { toast } from 'sonner';

const passwordResetFormSchema = z
    .object({
        newPassword: z
            .string()
            .min(6, 'Password must be at least 6 characters.')
            .max(100, 'Password must be at most 100 characters.')
            .regex(/[a-zA-Z]/, 'Password must contain at least one letter.')
            .regex(/[0-9]/, 'Password must contain at least one number.')
            .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character.'),
        repeatPassword: z.string().min(1, 'Please repeat your new password.'),
    })
    .refine((data) => data.newPassword === data.repeatPassword, {
        message: "Passwords don't match.",
        path: ['repeatPassword'],
    });

type PasswordResetFormValues = z.infer<typeof passwordResetFormSchema>;

export default function PasswordResetPage() {
    const [searchParams] = useSearchParams();
    const params = useParams<{ token?: string; email?: string }>();

    const token = (searchParams.get('token') || params.token || '').trim();
    const email = (searchParams.get('email') || params.email || '').trim();

    const [hideNewPassword, setHideNewPassword] = useState(true);
    const [hideRepeatPassword, setHideRepeatPassword] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const hasValidParams = Boolean(token && email);

    const form = useForm<PasswordResetFormValues>({
        resolver: zodResolver(passwordResetFormSchema),
        defaultValues: {
            newPassword: '',
            repeatPassword: '',
        },
    });

    async function onSubmit(data: PasswordResetFormValues) {
        if (!token || !email) {
            setApiError('Missing reset token or email. Please request a new password reset link.');
            return;
        }

        setIsLoading(true);
        setApiError(null);

        try {
            await authApi.resetPassword({
                email,
                token,
                newPassword: data.newPassword,
            });

            setIsSuccess(true);
            toast.success('Password was successfully reset!');
            form.reset();
        } catch (err: unknown) {
            console.error('Password reset failed:', err);
            let errorMessage = 'Failed to reset password. The link may be expired or invalid.';

            if (err && typeof err === 'object' && 'response' in err) {
                const responseData = (err as { response?: { data?: { message?: string } | string } }).response?.data;
                if (typeof responseData === 'string') {
                    errorMessage = responseData;
                } else if (responseData?.message) {
                    errorMessage = responseData.message;
                }
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }

            setApiError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
            <div className="mb-6 flex items-center gap-2">
                <Link
                    to="/"
                    className="flex items-center gap-2.5 font-semibold text-xl tracking-tight transition-opacity hover:opacity-85"
                >
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                        <Pyramid className="size-5" />
                    </div>
                    <span>Spectra</span>
                </Link>
            </div>

            <Card className="w-full max-w-md shadow-lg border-border">
                {!hasValidParams && !isSuccess && (
                    <>
                        <CardHeader className="text-center pb-2">
                            <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-destructive/15 text-destructive dark:bg-destructive/20">
                                <XCircle className="size-8" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-destructive">
                                Invalid Reset Link
                            </CardTitle>
                            <CardDescription className="text-sm">
                                This password reset link is invalid or incomplete.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-center text-sm text-destructive">
                                The verification token or email address was missing from the URL. Please request a new password reset link.
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-2.5 pt-2">
                            <Button asChild className="w-full">
                                <Link to="/auth/login">
                                    <Mail className="size-4 mr-2" />
                                    Request New Reset Link
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full">
                                <Link to="/">
                                    <Home className="size-4 mr-2" />
                                    Return to Home
                                </Link>
                            </Button>
                        </CardFooter>
                    </>
                )}
                
                {isSuccess && (
                    <>
                        <CardHeader className="text-center pb-2">
                            <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                                <CheckCircle2 className="size-8" />
                            </div>
                            <CardTitle className="text-2xl font-bold">
                                Password Reset Successful!
                            </CardTitle>
                            <CardDescription className="text-sm">
                                Your account password has been updated.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center pt-2">
                            <p className="text-sm text-muted-foreground">
                                You can now log in to your Spectra account with your new password.
                            </p>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-2.5 pt-2">
                            <Button asChild className="w-full">
                                <Link to="/auth/login">
                                    <LogIn className="size-4 mr-2" />
                                    Proceed to Login
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full">
                                <Link to="/">
                                    <Home className="size-4 mr-2" />
                                    Return to Home
                                </Link>
                            </Button>
                        </CardFooter>
                    </>
                )}
                
                {hasValidParams && !isSuccess && (
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardHeader className="text-center pb-2">
                            <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <KeyRound className="size-7" />
                            </div>
                            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
                            <CardDescription className="text-sm">
                                Enter your new password below for{' '}
                                <span className="font-medium text-foreground">{email}</span>
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="flex flex-col gap-4 pt-2">
                            {apiError && (
                                <Alert variant="destructive">
                                    <AlertCircle className="size-4" />
                                    <AlertDescription>{apiError}</AlertDescription>
                                </Alert>
                            )}

                            <FieldGroup>
                                <Controller
                                    name="newPassword"
                                    control={form.control}
                                    disabled={isLoading}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor="newPassword">New password</FieldLabel>
                                            <InputGroup>
                                                <InputGroupInput
                                                    {...field}
                                                    id="newPassword"
                                                    type={hideNewPassword ? 'password' : 'text'}
                                                    placeholder="Enter new password"
                                                    autoComplete="new-password"
                                                    aria-invalid={fieldState.invalid}
                                                />
                                                <InputGroupAddon align="inline-end">
                                                    <InputGroupButton
                                                        type="button"
                                                        size="icon-xs"
                                                        className="ml-auto"
                                                        onClick={() => setHideNewPassword(!hideNewPassword)}
                                                    >
                                                        {hideNewPassword ? (
                                                            <EyeOffIcon className="size-4" />
                                                        ) : (
                                                            <EyeIcon className="size-4" />
                                                        )}
                                                    </InputGroupButton>
                                                </InputGroupAddon>
                                            </InputGroup>
                                            <FieldDescription>
                                                Must be at least 6 characters with letters, numbers, and symbols.
                                            </FieldDescription>
                                            {fieldState.invalid && (
                                                <FieldError errors={[fieldState.error]} />
                                            )}
                                        </Field>
                                    )}
                                />
                                
                                <Controller
                                    name="repeatPassword"
                                    control={form.control}
                                    disabled={isLoading}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor="repeatPassword">Repeat password</FieldLabel>
                                            <InputGroup>
                                                <InputGroupInput
                                                    {...field}
                                                    id="repeatPassword"
                                                    type={hideRepeatPassword ? 'password' : 'text'}
                                                    placeholder="Repeat new password"
                                                    autoComplete="new-password"
                                                    aria-invalid={fieldState.invalid}
                                                />
                                                <InputGroupAddon align="inline-end">
                                                    <InputGroupButton
                                                        type="button"
                                                        size="icon-xs"
                                                        className="ml-auto"
                                                        onClick={() => setHideRepeatPassword(!hideRepeatPassword)}
                                                    >
                                                        {hideRepeatPassword ? (
                                                            <EyeOffIcon className="size-4" />
                                                        ) : (
                                                            <EyeIcon className="size-4" />
                                                        )}
                                                    </InputGroupButton>
                                                </InputGroupAddon>
                                            </InputGroup>
                                            <FieldDescription>
                                                Please enter the same password once more to confirm.
                                            </FieldDescription>
                                            {fieldState.invalid && (
                                                <FieldError errors={[fieldState.error]} />
                                            )}
                                        </Field>
                                    )}
                                />
                            </FieldGroup>
                        </CardContent>

                        <CardFooter className="flex flex-col gap-2.5 pt-2">
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading || !form.formState.isDirty}
                            >
                                {isLoading ? (
                                    <>
                                        <Spinner className="size-4 mr-2" />
                                        Resetting password...
                                    </>
                                ) : (
                                    'Reset Password'
                                )}
                            </Button>
                            <Button asChild variant="outline" className="w-full">
                                <Link to="/auth/login">
                                    <LogIn className="size-4 mr-2" />
                                    Back to Login
                                </Link>
                            </Button>
                        </CardFooter>
                    </form>
                )}
            </Card>
        </div>
    );
}
