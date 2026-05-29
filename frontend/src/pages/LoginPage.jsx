// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [tab,      setTab]      = useState('login');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [name,     setName]     = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showDrop, setShowDrop] = useState(false);
  const { login }  = useAuth();
  const navigate   = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await login(email, password);
      navigate('/chat');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally { setLoading(false); }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}>

      {/* ── Left Panel ───────────────────────────────────── */}
      <div style={{
        width: '50%', minWidth: 480, background: '#fff',
        display: 'flex', flexDirection: 'column',
        padding: '28px 40px', position: 'relative', overflowY: 'auto'
      }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 0 }}>
          <img src="/logo.png" alt="LUMI AI" style={{ height: 48, objectFit: 'contain' }} />

          {/* "You are signing into" pill */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowDrop(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#F4F4F5', border: '1px solid #E4E4E7',
                borderRadius: 999, padding: '7px 14px', fontSize: 13,
                color: '#18181B', cursor: 'pointer', fontWeight: 450,
              }}
            >
              <span style={{ fontSize: 10, color: '#71717A' }}>You are signing into</span>
              <span style={{ fontWeight: 600 }}>LUMI Console</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="#71717A" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            {showDrop && (
              <div style={{
                position: 'absolute', right: 0, top: '110%', background: '#fff',
                border: '1px solid #E4E4E7', borderRadius: 10, padding: '6px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.1)', zIndex: 10, minWidth: 180
              }}>
                {['LUMI Console', 'LUMI Enterprise', 'LUMI Developer'].map(opt => (
                  <div key={opt} style={{
                    padding: '8px 12px', borderRadius: 7, fontSize: 13, cursor: 'pointer',
                    color: opt === 'LUMI Console' ? '#0D2FA3' : '#18181B',
                    background: opt === 'LUMI Console' ? '#EEF2FF' : 'transparent',
                    fontWeight: opt === 'LUMI Console' ? 600 : 400,
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F4F4F5'}
                    onMouseLeave={e => e.currentTarget.style.background = opt === 'LUMI Console' ? '#EEF2FF' : 'transparent'}
                  >{opt}</div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Centered form area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 360 }}>
            <h1 style={{ fontSize: 28, fontWeight: 600, color: '#09090B', marginBottom: 28, letterSpacing: '-0.5px' }}>
              Log into your account
            </h1>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 22 }}>
              {['login', 'register'].map(t => (
                <button key={t} onClick={() => { setTab(t); setError(''); }} style={{
                  flex: 1, height: 38, fontSize: 13.5, borderRadius: 8,
                  border: '1.5px solid', cursor: 'pointer', transition: 'all .15s',
                  background: tab === t ? '#09090B' : '#fff',
                  borderColor: tab === t ? '#09090B' : '#E4E4E7',
                  color: tab === t ? '#fff' : '#52525B',
                  fontWeight: tab === t ? 600 : 400,
                }}>
                  {t === 'login' ? 'Sign in' : 'Create account'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {tab === 'register' && (
                <input
                  value={name} onChange={e => setName(e.target.value)}
                  placeholder="Full name" type="text"
                  style={inputStyle}
                />
              )}
              <input
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Email address" type="email"
                style={inputStyle}
              />
              <input
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Password" type="password"
                style={inputStyle}
              />

              {error && (
                <div style={{ color: '#DC2626', fontSize: 12.5, textAlign: 'center', background: '#FEF2F2', padding: '8px 12px', borderRadius: 8, border: '1px solid #FECACA' }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} style={{
                height: 44, background: '#09090B', border: 'none', borderRadius: 8,
                fontSize: 14.5, fontWeight: 600, color: '#fff', marginTop: 4,
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                transition: 'opacity .15s',
              }}>
                {loading ? 'Authenticating…' : tab === 'login' ? 'Sign in to LUMI' : 'Create account'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: '#71717A' }}>
              {tab === 'login' ? "Don't have an account? " : "Already have an account? "}
              <span
                onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setError(''); }}
                style={{ color: '#0D2FA3', fontWeight: 600, cursor: 'pointer' }}
              >
                {tab === 'login' ? 'Sign up' : 'Sign in'}
              </span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', fontSize: 11.5, color: '#A1A1AA', marginTop: 8 }}>
          By continuing, you agree to Achtrex's{' '}
          <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Terms of Service</span>
          {' '}and{' '}
          <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Privacy Policy</span>.
        </p>
      </div>

      {/* ── Right Panel — Car Image ───────────────────────── */}
      <div style={{
        flex: 1,
        backgroundImage: 'url(/car_background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle gradient overlay for depth */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.05) 60%, rgba(13,47,163,0.2) 100%)',
        }} />
        {/* Tagline */}
        <div style={{
          position: 'absolute', bottom: 40, left: 40, right: 40,
          color: '#fff',
        }}>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', lineHeight: 1.3, textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
            Automotive intelligence,<br />reimagined.
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 8, textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>
            Powered by LUMI AI · Achtrex
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  height: 42, fontSize: 13.5,
  background: '#FAFAFA', border: '1.5px solid #E4E4E7',
  color: '#09090B', borderRadius: 8, padding: '0 14px',
  outline: 'none', transition: 'border-color .15s',
  width: '100%', boxSizing: 'border-box',
};
