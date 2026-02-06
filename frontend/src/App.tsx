import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SidebarLayout from './layouts/sidebar-layout';
import DashboardPage from './pages/DashboardPage';
import UrlManagamentPage from './pages/UrlManagamentPage';
import AnalyticsPage from './pages/AnalyticsPage';
import { useAppSelector } from './app/hooks';

function App() {
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Routes>
                <Route path="/" element={<SidebarLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/dashboard" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/" replace />} />
                    <Route path="/url-managament" element={isAuthenticated ? <UrlManagamentPage /> : <Navigate to="/" replace />} />
                    <Route path="/analytics" element={isAuthenticated ? <AnalyticsPage /> : <Navigate to="/" replace />} />
                </Route>
            
            </Routes>
        </div>
    );
}

export default App;