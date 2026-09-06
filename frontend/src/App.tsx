import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SidebarLayout from './layouts/sidebar-layout';
import DashboardPage from './pages/DashboardPage';
import UrlManagementPage from './pages/UrlManagementPage';
import AnalyticsPage from './pages/AnalyticsPage';
import { useAppSelector } from './app/hooks';
import {Toaster} from "@/components/ui/sonner.tsx";
import AuthLayout from "@/layouts/auth-layout.tsx";
import {LoginForm} from "@/features/auth/components/login-form.tsx";
import {RegisterForm} from "@/features/auth/components/register-form.tsx";
import {RequestResetPasswordForm} from "@/features/auth/components/request-reset-password-form.tsx";
import { GoogleOAuthProvider } from '@react-oauth/google';
import EmailVerificationPage from "@/pages/EmailVerificationPage.tsx";
import PasswordResetPage from "@/pages/PasswordResetPage.tsx";

function App() {
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    return (
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <div className="min-h-screen bg-background text-foreground">
            <Routes>
                <Route path="/verify-email" element={<EmailVerificationPage />} />
                <Route path="/forgot-password" element={<PasswordResetPage />} />
                <Route path="/" element={<SidebarLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/auth" element={isAuthenticated ? <Navigate to="/" replace /> : <AuthLayout/>}>
                        <Route index element={<Navigate to="login" replace />} />
                        <Route path="login" element={<LoginForm />} />
                        <Route path="register" element={<RegisterForm />} />
                        <Route path="forgot-password" element={<RequestResetPasswordForm />} />
                    </Route> 
                    <Route path="/dashboard" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/" replace />} />
                    <Route path="/url-management" element={isAuthenticated ? <UrlManagementPage /> : <Navigate to="/" replace />} />
                    <Route path="/analytics" element={isAuthenticated ? <AnalyticsPage /> : <Navigate to="/" replace />} />
                </Route>
            </Routes>
            <Toaster />
        </div>
        </GoogleOAuthProvider>
    );
}

export default App;
