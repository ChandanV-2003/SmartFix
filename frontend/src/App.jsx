import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Register from './pages/Register';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import UserDashboard from './pages/UserDashboard';
import TechnicianDashboard from './pages/TechnicianDashboard';
import { fetchAccount, logout, restoreUserState } from './slices/UserSlice.jsx';
import LandingPage from './pages/LandingPage';
import LandingEditor from './pages/LandingEditor';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

const DASHBOARD_CONFIG = {
    admin: { path: '/admin/dashboard', component: AdminDashboard, title: 'Admin Dashboard' },
    manager: { path: '/manager/dashboard', component: ManagerDashboard, title: 'Manager Dashboard' },
    user: { path: '/user/dashboard', component: UserDashboard, title: 'User Dashboard' },
    technician: { path: '/technician/dashboard', component: TechnicianDashboard, title: 'Technician Dashboard' }
};

export default function App() {
    const dispatch = useDispatch();
    const { user, token, status } = useSelector((state) => state.user);

    useEffect(() => {
        dispatch(restoreUserState());
    }, [dispatch]);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken && !token) {
            dispatch(fetchAccount());
        } else if (token && !user) {
            dispatch(fetchAccount());
        }
    }, [dispatch, token, user]);



    const handleLogout = () => dispatch(logout());

    const getDashboardConfig = () => {
        if (!token || !user?.role) {
            return null;
        }
        return DASHBOARD_CONFIG[user.role] || DASHBOARD_CONFIG.user;
    };

    const dashboardConfig = getDashboardConfig();

    // Show loading initially
    const isLoading = status === 'loading' || (token && !user && status !== 'failed');
    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: '#f5f7fa'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <h2>SmartFix is Loading...</h2>
                    <p>Please wait...</p>
                </div>
            </div>
        );
    }

    // If authenticated and has dashboard config
    if (dashboardConfig) {
        const DashboardComponent = dashboardConfig.component;
        return (
            <div className="dashboard-page">
                <header className="dashboard-header-nav">
                    <div className="dashboard-brand">
                        <h1>{dashboardConfig.title}</h1>
                    </div>
                    <div className="dashboard-user-info">
                        <span>Welcome, {user?.username || user?.email || 'User'}</span>
                        <button type="button" className="logout-btn" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </header>
                <main className="dashboard-main">
                    <Routes>
                        <Route path={dashboardConfig.path} element={<DashboardComponent />} />
                        {user?.role === 'admin' && (
                            <Route 
                                path="/admin/landing-editor" 
                                element={
                                    <ErrorBoundary>
                                        <LandingEditor />
                                    </ErrorBoundary>
                                } 
                            />
                        )}
                        <Route path="*" element={<Navigate to={dashboardConfig.path} replace />} />
                    </Routes>
                </main>
            </div>
        );
    }

    // Not authenticated - show auth pages
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={
                <div className="auth-page">
                    <div className="auth-blob auth-blob-one" aria-hidden="true" />
                    <div className="auth-blob auth-blob-two" aria-hidden="true" />
                    <div className="auth-layout">
                        <aside className="auth-brand">
                            <h1>SmartFix</h1>
                            <p>Streamlined complaint management for your peace of mind.</p>
                        </aside>
                        <main className="auth-panel">
                            <Login />
                        </main>
                    </div>
                </div>
            } />
            <Route path="/register" element={
                <div className="auth-page">
                    <div className="auth-blob auth-blob-one" aria-hidden="true" />
                    <div className="auth-blob auth-blob-two" aria-hidden="true" />
                    <div className="auth-layout">
                        <aside className="auth-brand">
                            <h1>SmartFix</h1>
                            <p>Streamlined complaint management for your peace of mind.</p>
                        </aside>
                        <main className="auth-panel">
                            <Register />
                        </main>
                    </div>
                </div>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}