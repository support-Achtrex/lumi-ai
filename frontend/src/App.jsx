// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppShell from './components/layout/AppShell';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
import VINPage from './pages/VINPage';
import FleetPage from './pages/FleetPage';
import InspectionPage from './pages/InspectionPage';
import DiagnosticsPage from './pages/DiagnosticsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import WorkflowAutomationPage from './pages/WorkflowAutomationPage';
import ConsoleShell from './components/layout/ConsoleShell';
import ConsoleDashboard from './pages/ConsoleDashboard';
import './index.css';

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'#607D8B' }}>Loading LUMI AI…</div>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<RequireAuth><AppShell /></RequireAuth>}>
            <Route index element={<Navigate to="/chat" replace />} />
            <Route path="chat"         element={<ChatPage />} />
            <Route path="chat/:id"     element={<ChatPage />} />
            <Route path="vin"          element={<VINPage />} />
            <Route path="fleet"        element={<FleetPage />} />
            <Route path="inspection"   element={<InspectionPage />} />
            <Route path="inspection/:id" element={<InspectionPage />} />
            <Route path="diagnostics"  element={<DiagnosticsPage />} />
            <Route path="analytics"    element={<AnalyticsPage />} />
            <Route path="workflow"     element={<WorkflowAutomationPage />} />
          </Route>
          <Route path="/console" element={<RequireAuth><ConsoleShell /></RequireAuth>}>
            <Route index element={<ConsoleDashboard />} />
            <Route path="*" element={<Navigate to="/console" replace />} />
          </Route>
          <Route path="*" element={<Navigate to="/chat" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
