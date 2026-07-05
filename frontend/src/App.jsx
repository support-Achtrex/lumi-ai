// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppShell from './components/layout/AppShell';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
import VINPage from './pages/VINPage';
import FleetPage from './pages/FleetPage';
import InspectionPage from './pages/InspectionPage';
import DiagnosticsPage from './pages/DiagnosticsPage';
import HistoryPage from './pages/HistoryPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ReportsPage from './pages/ReportsPage';
import PartsPage from './pages/PartsPage';
import WorkflowAutomationPage from './pages/WorkflowAutomationPage';
import AdminUsersPage from './pages/AdminUsersPage';
import ConsoleShell from './components/layout/ConsoleShell';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import ApiKeysPage from './pages/ApiKeysPage';
import ModelsPage from './pages/ModelsPage';
import BillingPage from './pages/BillingPage';
import DocumentationPage from './pages/DocumentationPage';
import ConsoleDashboard from './pages/ConsoleDashboard';
import LandingPage from './pages/LandingPage';

import UpgradeModal from './components/layout/UpgradeModal';
import './index.css';

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'#607D8B' }}>Loading AAIA…</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function GlobalRedirectHandler() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const reference = params.get('reference');
    const vin = params.get('vin');

    if (reference) {
      if (vin && !location.pathname.includes('/history')) {
        navigate(`/history?vin=${vin}&paid=true&reference=${reference}`, { replace: true });
      } else if (!vin && !location.pathname.includes('/billing') && !location.pathname.includes('/history')) {
        navigate(`/console/billing?reference=${reference}`, { replace: true });
      }
    }
  }, [location, navigate]);

  return null;
}

function AppContainer() {
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    const handler = () => setShowUpgrade(true);
    window.addEventListener('creditsExhausted', handler);
    return () => window.removeEventListener('creditsExhausted', handler);
  }, []);

  return (
    <>
      <BrowserRouter>
        <GlobalRedirectHandler />
        {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route element={<RequireAuth><AppShell /></RequireAuth>}>
            <Route path="/chat"         element={<ChatPage />} />
            <Route path="/chat/:id"     element={<ChatPage />} />
            <Route path="/vin"          element={<VINPage />} />
            <Route path="/fleet"        element={<FleetPage />} />
            <Route path="/inspection"   element={<InspectionPage />} />
            <Route path="/inspection/:id" element={<InspectionPage />} />
            <Route path="/diagnostics"  element={<DiagnosticsPage />} />
            <Route path="/history"      element={<HistoryPage />} />
            <Route path="/analytics"    element={<AnalyticsPage />} />
            <Route path="/reports"      element={<ReportsPage />} />
            <Route path="/parts"        element={<PartsPage />} />
            <Route path="/workflow"     element={<WorkflowAutomationPage />} />
            <Route path="/admin/users"  element={<AdminUsersPage />} />
          </Route>
          <Route path="/console" element={<RequireAuth><ConsoleShell /></RequireAuth>}>
            <Route index element={<Navigate to="/console/dashboard" replace />} />
            <Route path="dashboard" element={<ConsoleDashboard />} />
            <Route path="profile" element={<ProfileSettingsPage />} />
            <Route path="api-keys" element={<ApiKeysPage />} />
            <Route path="models" element={<ModelsPage />} />
            <Route path="billing" element={<BillingPage />} />
            <Route path="docs" element={<DocumentationPage />} />

            <Route path="*" element={<Navigate to="/console/dashboard" replace />} />
          </Route>
          <Route path="*" element={<Navigate to="/chat" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContainer />
    </AuthProvider>
  );
}
