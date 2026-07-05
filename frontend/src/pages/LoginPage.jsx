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
  const { login, register } = useAuth();
  const navigate   = useNavigate();

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
    <div style={{ 
      height: '100vh', 
      width: '100vw', 
      overflow: 'hidden', 
      position: 'relative', 
      backgroundColor: '#000',
      fontFamily: 'Inter, system-ui, sans-serif' 
    }}>
      
      {/* ── Background Video ─────────────────────────────── */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          objectFit: 'cover', zIndex: 0
        }}
      >
        <source src="/AAIA_Video.mp4" type="video/mp4" />
      </video>

      {/* ── Dark Overlay ─────────────────────────────────── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.65)', zIndex: 1
      }} />

      {/* ── Header ───────────────────────────────────────── */}
      <header style={{ 
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, 
        padding: '24px 40px', display: 'flex', justifyContent: 'flex-start'
      }}>
        <img 
          src="/logo.png" 
          alt="AAIA Logo" 
          style={{ height: '36px', objectFit: 'contain', cursor: 'pointer', filter: 'brightness(0) invert(1)' }}
          onClick={() => navigate('/')}
        />
      </header>

      {/* ── Central Login Form ───────────────────────────── */}
      <main style={{ 
        position: 'relative', zIndex: 10, height: '100%', 
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '20px'
      }}>
        
        <div style={{
          width: '100%', maxWidth: '420px', 
          background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px',
          padding: '40px', boxSizing: 'border-box',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}>
          
          <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#ffffff', marginBottom: '24px', textAlign: 'center', letterSpacing: '-0.02em' }}>
            {tab === 'login' ? 'Welcome Back' : 'Create an Account'}
          </h1>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '10px' }}>
            {['login', 'register'].map(t => (
              <button key={t} onClick={() => { setTab(t); setError(''); }} style={{
                flex: 1, height: '36px', fontSize: '13px', borderRadius: '6px',
                border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                background: tab === t ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: tab === t ? '#fff' : '#94a3b8',
                fontWeight: tab === t ? '600' : '500',
              }}>
                {t === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {tab === 'register' && (
              <>
                <input
                  value={name} onChange={e => setName(e.target.value)}
                  placeholder="Full Name" type="text" style={inputStyle} required
                />
                <input
                  value={company} onChange={e => setCompany(e.target.value)}
                  placeholder="Company Name" type="text" style={inputStyle} required
                />
                <input
                  value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="Phone Number" type="tel" style={inputStyle} required
                />
              </>
            )}
            
            <input
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Email Address" type="email" style={inputStyle} required
            />
            <input
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Password" type="password" style={inputStyle} required
            />

            {error && (
              <div style={{ color: '#fca5a5', fontSize: '13px', textAlign: 'center', background: 'rgba(220, 38, 38, 0.2)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(220, 38, 38, 0.3)' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              height: '48px', border: 'none', borderRadius: '8px',
              fontSize: '15px', fontWeight: '600', color: '#000', marginTop: '8px',
              background: '#ffffff', cursor: loading ? 'not-allowed' : 'pointer', 
              opacity: loading ? 0.7 : 1, transition: 'transform 0.2s, background 0.2s'
            }}
            onMouseOver={(e) => { if(!loading) e.currentTarget.style.background = '#f4f4f5'; }}
            onMouseOut={(e) => { if(!loading) e.currentTarget.style.background = '#ffffff'; }}
            >
              {loading ? 'Authenticating...' : tab === 'login' ? 'Access Platform' : 'Create Account'}
            </button>
          </form>

        </div>
      </main>
      
    </div>
  );
}

const inputStyle = {
  height: '48px', fontSize: '14px',
  background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255,255,255,0.1)',
  color: '#ffffff', borderRadius: '8px', padding: '0 16px',
  outline: 'none', transition: 'border-color 0.2s',
  width: '100%', boxSizing: 'border-box',
  fontFamily: 'inherit'
};
