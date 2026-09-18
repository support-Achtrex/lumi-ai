import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft, LogOut, KeyRound } from 'lucide-react';

export default function RequireAdmin({ children }) {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#0F172A',
        color: '#94A3B8',
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '3px solid rgba(59, 130, 246, 0.2)',
          borderTopColor: '#3B82F6',
          animation: 'spin 0.8s linear infinite',
          marginBottom: 16
        }} />
        <div style={{ fontSize: 14, fontWeight: 500, color: '#CBD5E1' }}>Verifying Administrator Privileges…</div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Not logged in -> Redirect to login with redirect param
  if (!user) {
    const redirectUrl = `/login?redirect=${encodeURIComponent(location.pathname + location.search)}`;
    return <Navigate to={redirectUrl} replace />;
  }

  // Logged in but not an admin -> Display friendly access restriction screen instead of crashing or blank page
  if (user.role !== 'admin') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#0B1120',
        color: '#F8FAFC',
        fontFamily: "'Inter', sans-serif",
        padding: 24
      }}>
        <div style={{
          maxWidth: 480,
          width: '100%',
          background: '#1E293B',
          borderRadius: 20,
          padding: '36px 32px',
          border: '1px solid #334155',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          textAlign: 'center'
        }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 20,
            background: 'rgba(239, 68, 68, 0.12)',
            color: '#EF4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto'
          }}>
            <ShieldAlert size={32} />
          </div>

          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#F8FAFC', margin: '0 0 10px 0', letterSpacing: '-0.3px' }}>
            Administrator Access Restricted
          </h1>

          <p style={{ fontSize: 13.5, color: '#94A3B8', lineHeight: 1.6, margin: '0 0 24px 0' }}>
            The <strong>AAIA Admin Control Center</strong> is reserved for authorized system administrators. 
            Your current account (<strong>{user.email}</strong>) has the role <strong>{user.role || 'user'}</strong>.
          </p>

          <div style={{
            background: '#0F172A',
            borderRadius: 12,
            padding: '12px 16px',
            fontSize: 12.5,
            color: '#64748B',
            marginBottom: 24,
            border: '1px solid #1E293B'
          }}>
            Default master credentials: <code style={{ color: '#38BDF8', fontWeight: 600 }}>admin@achtrex.com</code>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={() => navigate('/chat')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                padding: '12px 18px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={16} /> Return to User Workspace
            </button>

            <button
              onClick={async () => {
                await logout();
                navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: 'transparent',
                color: '#94A3B8',
                border: '1px solid #334155',
                padding: '11px 18px',
                borderRadius: 10,
                fontSize: 13.5,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <LogOut size={16} /> Switch Account / Log in as Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated as admin
  return children;
}
