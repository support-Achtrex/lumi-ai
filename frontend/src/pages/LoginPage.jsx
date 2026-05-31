// src/pages/LoginPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [tab,      setTab]      = useState('login');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [name,     setName]     = useState('');
  const [company,  setCompany]  = useState('');
  const [phone,    setPhone]    = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showDrop, setShowDrop] = useState(false);
  const { login, register } = useAuth();
  const navigate   = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password, company, phone);
      }
      navigate('/chat');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally { setLoading(false); }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}>

      {/* ── Left Panel ───────────────────────────────────── */}
      <div style={{
        width: isMobile ? '100%' : '50%', 
        minWidth: isMobile ? 'auto' : 480, 
        background: isMobile ? 'rgba(0,0,0,0.7)' : '#000',
        backdropFilter: isMobile ? 'blur(8px)' : 'none',
        display: 'flex', flexDirection: 'column',
        padding: isMobile ? '20px' : '28px 40px', 
        position: isMobile ? 'absolute' : 'relative', 
        inset: isMobile ? 0 : 'auto',
        zIndex: 10,
        overflowY: 'auto'
      }}>

        {/* Centered form area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 360 }}>
            <img src="/logo.png" alt="LUMI AI" style={{ height: 64, objectFit: 'contain', display: 'block', margin: '0 auto 24px auto' }} />
            <h1 style={{ fontSize: 28, fontWeight: 600, color: '#fff', marginBottom: 28, letterSpacing: '-0.5px', textAlign: 'center' }}>
              Log into your account
            </h1>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 22 }}>
              {['login', 'register'].map(t => (
                <button key={t} onClick={() => { setTab(t); setError(''); }} style={{
                  flex: 1, height: 38, fontSize: 13.5, borderRadius: 8,
                  border: '1.5px solid', cursor: 'pointer', transition: 'all .15s',
                  background: tab === t ? '#fff' : 'transparent',
                  borderColor: tab === t ? '#fff' : '#27272A',
                  color: tab === t ? '#09090B' : '#A1A1AA',
                  fontWeight: tab === t ? 600 : 400,
                }}>
                  {t === 'login' ? 'Sign in' : 'Create account'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {tab === 'register' && (
                <>
                  <input
                    value={name} onChange={e => setName(e.target.value)}
                    placeholder="Full name" type="text"
                    style={inputStyle}
                  />
                  <input
                    value={company} onChange={e => setCompany(e.target.value)}
                    placeholder="Company name" type="text"
                    style={inputStyle}
                  />
                  <input
                    value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="Phone number" type="tel"
                    style={inputStyle}
                  />
                </>
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
                height: 44, background: '#fff', border: 'none', borderRadius: 8,
                fontSize: 14.5, fontWeight: 600, color: '#09090B', marginTop: 4,
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
                style={{ color: '#60A5FA', fontWeight: 600, cursor: 'pointer' }}
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

      {/* ── Right Panel — Car Video ───────────────────────── */}
      <div style={{
        flex: 1,
        position: isMobile ? 'absolute' : 'relative',
        inset: 0,
        overflow: 'hidden',
        backgroundColor: '#000',
        zIndex: 0
      }}>
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: isMobile ? 'cover' : 'contain',
            objectPosition: 'center',
            top: 0,
            left: 0,
            zIndex: 0
          }}
        >
          <source src="/Lumi_video.mp4" type="video/mp4" />
        </video>
        {/* Subtle gradient overlay for depth */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 60%, rgba(13,47,163,0.3) 100%)',
          zIndex: 1
        }} />

      </div>
    </div>
  );
}

const inputStyle = {
  height: 42, fontSize: 13.5,
  background: '#18181B', border: '1.5px solid #27272A',
  color: '#fff', borderRadius: 8, padding: '0 14px',
  outline: 'none', transition: 'border-color .15s',
  width: '100%', boxSizing: 'border-box',
};
