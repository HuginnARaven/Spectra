import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SidebarLayout from './layouts/sidebar-layout';
import DashboardPage from './pages/DashboardPage';
import UrlManagamentPage from './pages/UrlManagamentPage';
import AnalyticsPage from './pages/AnalyticsPage';

function App() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Routes>
                <Route path="/" element={<SidebarLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/url-managament" element={<UrlManagamentPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                </Route>
            
            </Routes>
        </div>
    );
}

export default App;