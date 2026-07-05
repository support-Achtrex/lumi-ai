import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

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
        padding: '24px 40px', display: 'flex', justifyContent: 'flex-end'
      }}>
        <button 
          onClick={() => navigate('/login')}
          style={{
            padding: '8px 24px', background: 'transparent', color: '#fff', 
            border: '1px solid rgba(255,255,255,0.4)', borderRadius: '30px', cursor: 'pointer',
            fontSize: '14px', fontWeight: '500', transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#000'; }}
          onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#fff'; }}
        >
          Sign In
        </button>
      </header>

      {/* ── Central Content ──────────────────────────────── */}
      <main style={{ 
        position: 'relative', zIndex: 10, height: '100%', 
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '20px'
      }}>
        
        {/* AAIA Logo */}
        <img 
          src="/logo.png" 
          alt="AAIA Logo" 
          style={{ 
            height: '80px', objectFit: 'contain', marginBottom: '24px',
            filter: 'brightness(0) invert(1)' // Ensures it's white if the original logo is dark
          }} 
        />
        
        {/* Text */}
        <h1 style={{ 
          fontSize: '48px', fontWeight: '600', color: '#ffffff', 
          letterSpacing: '-0.02em', marginBottom: '16px', textAlign: 'center'
        }}>
          The Autonomous Reasoning Engine for Mobility.
        </h1>
        <p style={{
          fontSize: '20px', color: '#cbd5e1', textAlign: 'center',
          maxWidth: '700px', marginBottom: '24px', lineHeight: '1.5'
        }}>
          Bridging the gap between static vehicle data and actionable intelligence.
        </p>
        <div style={{ 
          display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center',
          fontSize: '14px', color: '#94a3b8', marginBottom: '48px', fontWeight: '600',
          letterSpacing: '0.05em', textTransform: 'uppercase'
        }}>
          <span>Conversational Analytics</span>
          <span>•</span>
          <span>Predictive Alerts</span>
          <span>•</span>
          <span>Intelligent Repair</span>
          <span>•</span>
          <span>Real-time Reasoning</span>
        </div>
        
        {/* Call to Action */}
        <button 
          onClick={() => navigate('/login')}
          style={{
            padding: '16px 48px', background: '#ffffff', color: '#000000', 
            border: 'none', borderRadius: '4px', cursor: 'pointer',
            fontSize: '14px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase',
            transition: 'transform 0.3s ease, background 0.3s ease'
          }}
          onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.background = '#f4f4f5'; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = '#ffffff'; }}
        >
          Access Platform
        </button>

      </main>
      
    </div>
  );
}
