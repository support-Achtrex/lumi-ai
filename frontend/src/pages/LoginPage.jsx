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
  const { login }  = useAuth();
  const navigate   = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        const { useAuth } = await import('../context/AuthContext');
      }
      navigate('/chat');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#050E1A', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ width:'100%', maxWidth:400 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <img src="/logo.png" alt="LUMI AI" style={{ height: 60, objectFit: 'contain', margin: '0 auto 16px', display: 'block' }} />
          <div style={{ fontSize:13, color:'#607D8B' }}>Automotive intelligence by Achtrex</div>
        </div>
        <div style={{ background:'#0A1628', border:'0.5px solid #1C2B3A', borderRadius:12, padding:28 }}>
          <div style={{ display:'flex', gap:4, marginBottom:20 }}>
            {['login','register'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ flex:1, height:34, fontSize:13, borderRadius:8, border:'0.5px solid', background: tab===t?'#0D2FA3':'transparent', borderColor: tab===t?'#0D2FA3':'#1C2B3A', color: tab===t?'#fff':'#607D8B' }}>
                {t === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {tab === 'register' && (
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" type="text" style={{ height:40, fontSize:13, background:'#050E1A', border:'0.5px solid #1C2B3A', color:'#fff', borderRadius:8 }} />
            )}
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" type="email" style={{ height:40, fontSize:13, background:'#050E1A', border:'0.5px solid #1C2B3A', color:'#fff', borderRadius:8 }} />
            <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" style={{ height:40, fontSize:13, background:'#050E1A', border:'0.5px solid #1C2B3A', color:'#fff', borderRadius:8 }} />
            {error && <div style={{ color:'#F09595', fontSize:12, textAlign:'center' }}>{error}</div>}
            <button type="submit" disabled={loading} style={{ height:42, background:'#00C8A8', border:'none', borderRadius:8, fontSize:14, fontWeight:500, color:'#04342C', marginTop:4 }}>
              {loading ? 'Loading…' : tab === 'login' ? 'Sign in to LUMI AI' : 'Create account'}
            </button>
          </form>
        </div>
        <div style={{ textAlign:'center', marginTop:16, fontSize:12, color:'#607D8B' }}>
          achtrex.com · Confidential · 2026
        </div>
      </div>
    </div>
  );
}
