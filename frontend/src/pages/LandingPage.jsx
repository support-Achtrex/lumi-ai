import React from 'react';
import { useNavigate } from 'react-router-dom';
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

  return (
    <div className="landing-bg" style={{ 
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

      {/* ── Central Content ──────────────────────────────── */}
      <main style={{ 
        position: 'relative', zIndex: 10, height: '100%', 
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '20px'
      }}>
        
        {/* AAIA Brand Logo & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: '24px' }}>
          <img 
            src="/favicon.png" 
            alt="AAIA Logo" 
            style={{ 
              height: '76px', width: '76px', objectFit: 'contain'
            }} 
          />
          <span style={{ 
            fontSize: '52px', fontWeight: '800', color: '#ffffff', 
            letterSpacing: '-0.03em', fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
          }}>
            AAIA
          </span>
        </div>
        
        {/* Text */}
        <h1 style={{ 
          fontSize: '48px', fontWeight: '600', color: '#ffffff', 
          letterSpacing: '-0.02em', marginBottom: '16px', textAlign: 'center',
          maxWidth: '900px'
        }}>
          The Autonomous Reasoning Engine for Automotive Intelligence.
        </h1>
        <p style={{
          fontSize: '20px', color: '#cbd5e1', textAlign: 'center',
          maxWidth: '750px', marginBottom: '28px', lineHeight: '1.5'
        }}>
          Bridging the gap between vehicle diagnostics, visual AI scanning, and certified mobile repair. Empowering drivers, master mechanics, and service centers with real-time AI solutions.
        </p>
        <div style={{ 
          display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center',
          fontSize: '13px', color: '#94a3b8', marginBottom: '48px', fontWeight: '600',
          letterSpacing: '0.05em', textTransform: 'uppercase', alignItems: 'center'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Activity size={14} /> Conversational Analytics</span>
          <span>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Cpu size={14} /> Predictive Maintenance</span>
          <span>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Zap size={14} /> Intelligent Repair</span>
          <span>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ShieldCheck size={14} /> Diagnostic Reasoning</span>
        </div>
        
        {/* Call to Action */}
        <button 
          onClick={() => navigate('/login')}
          style={{
            padding: '16px 48px', background: '#ffffff', color: '#000000', 
            border: 'none', borderRadius: '4px', cursor: 'pointer',
            fontSize: '14px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase',
            transition: 'transform 0.3s ease, background 0.3s ease',
            display: 'flex', alignItems: 'center', gap: 10
          }}
          onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.background = '#f4f4f5'; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = '#ffffff'; }}
        >
          Access Platform <ArrowRight size={16} />
        </button>

      </main>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10,
        padding: '16px 40px', display: 'flex', justifyContent: 'center',
        borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.5)'
      }}>
        <p style={{ fontSize: '12px', color: '#64748b', textAlign: 'center' }}>
          &copy; {new Date().getFullYear()} Achtrex LLC. All rights reserved. AAIA Cognitive Automotive Platform.
        </p>
      </footer>
      
    </div>
  );
}
