import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SidebarLayout from './layouts/sidebar-layout';
import DashboardPage from './pages/DashboardPage';
import UrlManagementPage from './pages/UrlManagementPage';
import AnalyticsPage from './pages/AnalyticsPage';
import { useAppSelector } from './app/hooks';
import {Toaster} from "@/components/ui/sonner.tsx";

function App() {
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Routes>
                <Route path="/" element={<SidebarLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/dashboard" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/" replace />} />
                    <Route path="/url-management" element={isAuthenticated ? <UrlManagementPage /> : <Navigate to="/" replace />} />
                    <Route path="/analytics" element={isAuthenticated ? <AnalyticsPage /> : <Navigate to="/" replace />} />
                </Route>
            </Routes>
            <Toaster />
        </div>
    );
}

export default App;
