import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { CheckCircle2, XCircle, LogIn, Home, RefreshCw, Pyramid } from 'lucide-react';
import agent from "@/api/agent.ts";
import {useAppSelector} from "@/app/hooks.ts";


interface VerifyEmailResponse {
    message: string;
}

type VerificationStatus = 'loading' | 'success' | 'error';

async function verifyEmailToken(token: string, email: string): Promise<VerifyEmailResponse> {
    const response = await agent.post<VerifyEmailResponse>('/account/confirm-email', {token: token, email: email});
    return response.data;
}

export default function EmailVerificationPage() {
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    
    const [searchParams] = useSearchParams();
    const params = useParams<{ token?: string, email?: string }>();
    
    const token = (searchParams.get('token') || params.token || '').trim();
    const email = (searchParams.get('email') || params.email || '').trim();

    const [status, setStatus] = useState<VerificationStatus>(() => (token ? 'loading' : 'error'));
    const [message, setMessage] = useState<string>(() =>
        token && email
            ? ''
            : 'No verification token was found in the link. Please check your email verification link or request a new one.'
    );

    const hasAttemptedRef = useRef(false);

    useEffect(() => {
        if (!token) {
            return;
        }
        
        hasAttemptedRef.current = true;
        let isCancelled = false;

         verifyEmailToken(token, email)
            .then((response) => {
                if (!isCancelled) {
                    setStatus('success');
                    setMessage(response.message);
                }
            })
            .catch((error: unknown) => {
                if (!isCancelled) {
                    setStatus('error');
                    const errorMessage =
                        error instanceof Error
                            ? error.message
                            : 'An unexpected error occurred while verifying your email. Please try again later.';
                    setMessage(errorMessage);
                }
            });

        return () => {
            isCancelled = true;
        };
    }, [token, email]);

    const handleRetry = () => {
        if (!token) return;

        setStatus('loading');
        setMessage('');

        verifyEmailToken(token, email)
            .then((response) => {
                setStatus('success');
                setMessage(response.message);
            })
            .catch((error: unknown) => {
                setStatus('error');
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : 'An unexpected error occurred while verifying your email. Please try again later.';
                setMessage(errorMessage);
            });
    };

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
                {status === 'loading' && (
                    <>
                        <CardHeader className="text-center pb-2">
                            <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Spinner className="size-7" />
                            </div>
                            <CardTitle className="text-2xl font-bold">Verifying Your Email</CardTitle>
                            <CardDescription className="text-sm">
                                Please wait while we verify your verification token...
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center pt-2">
                            <p className="text-sm text-muted-foreground">
                                This will only take a few moments. Please do not close or navigate away from this page.
                            </p>
                        </CardContent>
                    </>
                )}
                
                {status === 'success' && (
                    <>
                        <CardHeader className="text-center pb-2">
                            <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                                <CheckCircle2 className="size-8" />
                            </div>
                            <CardTitle className="text-2xl font-bold">Email Verified!</CardTitle>
                            <CardDescription className="text-sm">
                                Your email address has been successfully confirmed.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center pt-2">
                            <p className="text-sm text-muted-foreground">
                                {message || 'Your email address has been successfully verified. You can now log in to your account and explore Spectra.'}
                            </p>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-2.5 pt-2">
                            {isAuthenticated ?
                                <></>
                                :
                                <Button asChild className="w-full">
                                    <Link to="/auth/login">
                                        <LogIn className="size-4" />
                                        Proceed to Login
                                    </Link>
                                </Button>
                            }
                            <Button asChild variant="outline" className="w-full">
                                <Link to="/">
                                    <Home className="size-4" />
                                    Return to Home
                                </Link>
                            </Button>
                        </CardFooter>
                    </>
                )}
                
                {status === 'error' && (
                    <>
                        <CardHeader className="text-center pb-2">
                            <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-destructive/15 text-destructive dark:bg-destructive/20">
                                <XCircle className="size-8" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-destructive">
                                Verification Failed
                            </CardTitle>
                            <CardDescription className="text-sm">
                                We were unable to verify your email address.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-center text-sm text-destructive">
                                {message}
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-2.5 pt-2">
                            {Boolean(token) && (
                                <Button onClick={handleRetry} variant="default" className="w-full">
                                    <RefreshCw className="size-4" />
                                    Try Again
                                </Button>
                            )}
                            <Button asChild variant={token ? 'outline' : 'default'} className="w-full">
                                <Link to="/auth/login">
                                    <LogIn className="size-4" />
                                    Back to Login
                                </Link>
                            </Button>
                            <Button asChild variant="ghost" className="w-full">
                                <Link to="/">
                                    <Home className="size-4" />
                                    Return to Home
                                </Link>
                            </Button>
                        </CardFooter>
                    </>
                )}
            </Card>
        </div>
    );
}
