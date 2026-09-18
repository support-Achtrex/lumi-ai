import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  ArrowRight, 
  Bot, 
  Zap, 
  ShieldCheck, 
  Activity, 
  Cpu 
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="landing-bg" style={{ 
      minHeight: '100vh', 
      width: '100%', 
      overflowY: 'auto', 
      position: 'relative', 
      backgroundColor: '#050E1A',
      background: 'radial-gradient(circle at 50% 20%, #0F2042 0%, #050E1A 75%)',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      
      {/* ── Background Video with Dark Overlay ────────────── */}
      <video
        autoPlay
        loop
        muted
        playsInline
        poster="/car_background.png"
        style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          objectFit: 'cover', zIndex: 0, pointerEvents: 'none'
        }}
      >
        <source src="/AAIA_Video.mp4" type="video/mp4" />
      </video>

      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: 'rgba(5, 14, 26, 0.72)', zIndex: 1, pointerEvents: 'none'
      }} />

      {/* ── Top Header Navigation ─────────────────────────── */}
      <header style={{
        position: 'relative', zIndex: 10,
        padding: 'calc(env(safe-area-inset-top, 0px) + 16px) 20px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img 
            src="/favicon.png" 
            alt="AAIA Logo" 
            style={{ 
              height: '38px', width: '38px', objectFit: 'contain'
            }} 
          />
          <span style={{ 
            fontSize: '24px', fontWeight: '800', color: '#ffffff', 
            letterSpacing: '-0.02em'
          }}>
            AAIA
          </span>
        </div>

        <div>
          <button
            onClick={() => navigate(user ? '/chat' : '/login')}
            style={{
              padding: '9px 18px',
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'; }}
          >
            {user ? 'Open Dashboard' : 'Sign In'}
          </button>
        </div>
      </header>

      {/* ── Central Content ──────────────────────────────── */}
      <main style={{ 
        position: 'relative', zIndex: 10, flex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '32px 20px 48px', textAlign: 'center', maxWidth: '1000px', margin: '0 auto', width: '100%', boxSizing: 'border-box'
      }}>
        
        {/* AAIA Brand Logo & Title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: '20px' }}>
          <img 
            src="/favicon.png" 
            alt="AAIA Logo" 
            style={{ 
              height: 'clamp(52px, 12vw, 76px)', width: 'clamp(52px, 12vw, 76px)', objectFit: 'contain'
            }} 
          />
          <span style={{ 
            fontSize: 'clamp(38px, 9vw, 56px)', fontWeight: '800', color: '#ffffff', 
            letterSpacing: '-0.03em'
          }}>
            AAIA
          </span>
        </div>
        
        {/* Text Heading */}
        <h1 style={{ 
          fontSize: 'clamp(26px, 5.5vw, 46px)', fontWeight: '700', color: '#ffffff', 
          letterSpacing: '-0.02em', marginBottom: '16px', lineHeight: 1.25,
          maxWidth: '850px'
        }}>
          The Autonomous Reasoning Engine for Automotive Intelligence.
        </h1>

        <p style={{
          fontSize: 'clamp(14px, 3.5vw, 18px)', color: '#cbd5e1',
          maxWidth: '720px', marginBottom: '28px', lineHeight: '1.55'
        }}>
          Bridging the gap between vehicle diagnostics, visual AI scanning, and certified mobile repair. Empowering drivers, master mechanics, and service centers with real-time AI solutions.
        </p>

        {/* Feature Tags */}
        <div style={{ 
          display: 'flex', gap: '10px 16px', flexWrap: 'wrap', justifyContent: 'center',
          fontSize: '12.5px', color: '#94a3b8', marginBottom: '36px', fontWeight: '600',
          letterSpacing: '0.03em', textTransform: 'uppercase', alignItems: 'center'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Activity size={14} color="#38BDF8" /> Conversational Analytics</span>
          <span style={{ display: 'none' }}>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Cpu size={14} color="#A78BFA" /> Predictive Maintenance</span>
          <span style={{ display: 'none' }}>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Zap size={14} color="#FBBF24" /> Intelligent Repair</span>
          <span style={{ display: 'none' }}>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ShieldCheck size={14} color="#34D399" /> Diagnostic Reasoning</span>
        </div>
        
        {/* Call to Action Button */}
        <button 
          onClick={() => navigate(user ? '/chat' : '/login')}
          style={{
            padding: '16px 42px', background: '#ffffff', color: '#0A141D', 
            border: 'none', borderRadius: '10px', cursor: 'pointer',
            fontSize: '14.5px', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase',
            transition: 'transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease',
            display: 'inline-flex', alignItems: 'center', gap: 10,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)'
          }}
          onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = '#f1f5f9'; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = '#ffffff'; }}
        >
          {user ? 'Enter Dashboard' : 'Access Platform'} <ArrowRight size={17} />
        </button>

      </main>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer style={{
        position: 'relative', zIndex: 10,
        padding: '16px 24px', display: 'flex', justifyContent: 'center',
        borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(5, 14, 26, 0.7)'
      }}>
        <p style={{ fontSize: '12px', color: '#64748b', textAlign: 'center', margin: 0 }}>
          &copy; {new Date().getFullYear()} Achtrex LLC. All rights reserved. AAIA Cognitive Automotive Platform.
        </p>
      </footer>
      
    </div>
  );
}
