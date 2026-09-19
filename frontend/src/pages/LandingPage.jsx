import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  ArrowRight, 
  Bot, 
  Zap, 
  ShieldCheck, 
  Activity, 
  Cpu,
  Camera,
  Wrench,
  Truck,
  FileText,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Code2
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    document.title = "AAIA | Automotive AI Platform, Predictive Diagnostics & Fleet Intelligence";
  }, []);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const features = [
    {
      icon: <Camera size={26} color="#38BDF8" />,
      title: "Visual AI Damage Scanner",
      description: "Upload exterior or interior vehicle images to detect structural dents, paint scratches, glass fractures, and fluid leaks with neural bounding-box precision."
    },
    {
      icon: <Cpu size={26} color="#A78BFA" />,
      title: "Predictive Fleet Diagnostics",
      description: "Harness continuous sensor telemetry to calculate real-time vehicle health scores and anticipate component degradation before catastrophic roadside failures."
    },
    {
      icon: <Bot size={26} color="#34D399" />,
      title: "Conversational Master Mechanic AI",
      description: "Diagnose OBD-II Diagnostic Trouble Codes (DTCs), symptoms, and anomalous engine behavior with multi-model cognitive reasoning and OEM-grade procedures."
    },
    {
      icon: <FileText size={26} color="#FBBF24" />,
      title: "Deep VIN Intelligence & History",
      description: "Decode 17-digit VINs instantly. Access authoritative vehicle specifications, salvage records, title brands, open safety recalls, and auction histories."
    },
    {
      icon: <Wrench size={26} color="#F43F5E" />,
      title: "Intelligent Repair Workflows",
      description: "Automate parts estimation, labor time calculations, and step-by-step repair guides tailored to exact vehicle year, make, model, and engine variant."
    },
    {
      icon: <Code2 size={26} color="#60A5FA" />,
      title: "Enterprise & Developer Console",
      description: "Integrate automotive AI into your proprietary fleet management systems, ERPs, and mobile apps with robust REST APIs, webhooks, and custom models."
    }
  ];

  const audiences = [
    {
      icon: <Truck size={28} color="#38BDF8" />,
      title: "Fleet Operators",
      tagline: "Maximize Uptime & Minimize TCO",
      bullets: [
        "Real-time telematics health scoring across thousands of assets",
        "Predictive scheduling to prevent expensive en-route breakdowns",
        "Centralized fleet audit trails and automated compliance reports"
      ]
    },
    {
      icon: <Wrench size={28} color="#A78BFA" />,
      title: "Service Centers & Techs",
      tagline: "Faster Turnarounds & Precise Root Cause",
      bullets: [
        "Instant OBD-II code resolution and manufacturer service bulletins",
        "Visual inspection documentation for customer transparency",
        "Accurate OEM part number lookups and automated repair estimates"
      ]
    },
    {
      icon: <ShieldCheck size={28} color="#34D399" />,
      title: "Vehicle Owners & Drivers",
      tagline: "Transparent Automotive Intelligence",
      bullets: [
        "Plain-English diagnostic explanations for check engine lights",
        "Pre-purchase VIN verification and structural damage scans",
        "Instant access to certified mobile mechanics and local repair shops"
      ]
    }
  ];

  const faqs = [
    {
      q: "What is AAIA and how does it assist automotive diagnostics?",
      a: "AAIA (Automotive Artificial Intelligence Application) is an autonomous reasoning platform that connects vehicle telemetry, OBD-II diagnostic fault codes, visual damage scanning, and multi-model AI reasoning to diagnose vehicle issues, predict failures, and recommend precise repair procedures."
    },
    {
      q: "Can AAIA decode any VIN and provide historical vehicle reports?",
      a: "Yes. AAIA features deep VIN decoding capabilities across major automotive makes and models, fetching specs, salvage records, title brands, recall histories, and auction data in seconds."
    },
    {
      q: "How does AAIA visual car inspection work?",
      a: "AAIA uses high-accuracy computer vision to analyze vehicle photos and video feeds, automatically detecting scratches, dents, misalignments, fluid leaks, and structural wear with bounding box diagnostics."
    },
    {
      q: "Is AAIA designed for fleet managers as well as individual mechanics?",
      a: "Yes. AAIA scales from individual DIY drivers and master mechanics to enterprise fleet operators with predictive health scoring, automated maintenance schedules, and dispatch integration."
    }
  ];

  return (
    <div className="landing-bg" style={{ 
      minHeight: '100vh', 
      width: '100%', 
      overflowY: 'auto', 
      position: 'relative', 
      backgroundColor: '#050E1A',
      background: 'radial-gradient(circle at 50% 10%, #0F2042 0%, #050E1A 60%)',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      color: '#ffffff'
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
          objectFit: 'cover', zIndex: 0, pointerEvents: 'none', opacity: 0.35
        }}
      >
        <source src="/AAIA_Video.mp4" type="video/mp4" />
      </video>

      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: 'rgba(5, 14, 26, 0.85)', zIndex: 1, pointerEvents: 'none'
      }} />

      {/* ── Top Header Navigation ─────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        backdropFilter: 'blur(16px)',
        backgroundColor: 'rgba(5, 14, 26, 0.75)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: 'calc(env(safe-area-inset-top, 0px) + 14px) 24px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img 
            src="/favicon.png" 
            alt="AAIA Automotive AI Platform" 
            style={{ 
              height: '36px', width: '36px', objectFit: 'contain'
            }} 
          />
          <span style={{ 
            fontSize: '22px', fontWeight: '800', color: '#ffffff', 
            letterSpacing: '-0.02em'
          }}>
            AAIA
          </span>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => navigate(user ? '/chat' : '/login')}
            style={{
              padding: '8px 18px',
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '13.5px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.22)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'; }}
          >
            {user ? 'Open Dashboard' : 'Sign In'}
          </button>
        </nav>
      </header>

      {/* ── Main Hero Section ──────────────────────────────── */}
      <main style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        
        <section style={{ 
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '60px 0 70px', textAlign: 'center'
        }}>
          
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', borderRadius: '30px',
            background: 'rgba(56, 189, 248, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            color: '#38BDF8', fontSize: '12.5px', fontWeight: '700',
            letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '24px'
          }}>
            <Sparkles size={14} /> Cognitive Automotive Intelligence
          </div>
          
          {/* Main H1 Title */}
          <h1 style={{ 
            fontSize: 'clamp(32px, 6vw, 54px)', fontWeight: '800', color: '#ffffff', 
            letterSpacing: '-0.03em', marginBottom: '20px', lineHeight: 1.18,
            maxWidth: '920px'
          }}>
            The Autonomous Reasoning Engine for Automotive Intelligence.
          </h1>

          <p style={{
            fontSize: 'clamp(15px, 3.5vw, 19px)', color: '#cbd5e1',
            maxWidth: '780px', marginBottom: '36px', lineHeight: '1.6'
          }}>
            Bridging the gap between real-time vehicle telemetry, computer vision damage scanning, predictive fleet maintenance, and certified mobile repair.
          </p>

          {/* Tag Pill Highlights */}
          <div style={{ 
            display: 'flex', gap: '10px 18px', flexWrap: 'wrap', justifyContent: 'center',
            fontSize: '12.5px', color: '#94a3b8', marginBottom: '40px', fontWeight: '600',
            letterSpacing: '0.03em', textTransform: 'uppercase', alignItems: 'center'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Activity size={14} color="#38BDF8" /> Telematics Analytics</span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Cpu size={14} color="#A78BFA" /> Predictive Maintenance</span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Zap size={14} color="#FBBF24" /> Instant Diagnostics</span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ShieldCheck size={14} color="#34D399" /> Diagnostic Reasoning</span>
          </div>
          
          {/* Primary Action Button */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button 
              onClick={() => navigate(user ? '/chat' : '/login')}
              style={{
                padding: '16px 40px', background: '#ffffff', color: '#0A141D', 
                border: 'none', borderRadius: '10px', cursor: 'pointer',
                fontSize: '14.5px', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase',
                transition: 'transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease',
                display: 'inline-flex', alignItems: 'center', gap: 10,
                boxShadow: '0 10px 30px rgba(56, 189, 248, 0.25)'
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = '#f1f5f9'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = '#ffffff'; }}
            >
              {user ? 'Enter Dashboard' : 'Get Started with AAIA'} <ArrowRight size={17} />
            </button>
          </div>

        </section>

        {/* ── Feature Capabilities Grid ────────────────────────── */}
        <section style={{ padding: '60px 0 80px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: '700', letterSpacing: '-0.02em', marginBottom: '12px' }}>
              Comprehensive Automotive AI Suite
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '640px', margin: '0 auto' }}>
              Designed for precision engineering, proactive fleet protection, and instant mechanical reasoning.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {features.map((feature, idx) => (
              <article 
                key={idx}
                style={{
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: '14px',
                  padding: '28px',
                  transition: 'transform 0.2s ease, border-color 0.2s ease'
                }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ 
                  width: '48px', height: '48px', borderRadius: '10px', 
                  background: 'rgba(255,255,255,0.05)', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', marginBottom: '18px' 
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '10px', color: '#f8fafc' }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.6', margin: 0 }}>
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* ── Target Stakeholders / Personas ──────────────────── */}
        <section style={{ padding: '60px 0 80px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: '700', letterSpacing: '-0.02em', marginBottom: '12px' }}>
              Built for Every Automotive Stakeholder
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '640px', margin: '0 auto' }}>
              Tailored workflows for enterprises, certified technicians, and vehicle owners.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {audiences.map((aud, idx) => (
              <div 
                key={idx}
                style={{
                  background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.7) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.09)',
                  borderRadius: '14px',
                  padding: '30px',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ marginBottom: '16px' }}>{aud.icon}</div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '6px', color: '#ffffff' }}>{aud.title}</h3>
                <div style={{ fontSize: '13px', color: '#38BDF8', fontWeight: '600', marginBottom: '18px' }}>{aud.tagline}</div>
                <ul style={{ paddingLeft: '0', listStyle: 'none', margin: '0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {aud.bullets.map((b, bIdx) => (
                    <li key={bIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13.5px', color: '#cbd5e1', lineHeight: '1.5' }}>
                      <CheckCircle2 size={16} color="#34D399" style={{ flexShrink: 0, marginTop: '3px' }} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── Interactive FAQ Section ──────────────────────────── */}
        <section style={{ padding: '60px 0 80px', borderTop: '1px solid rgba(255,255,255,0.08)', maxWidth: '850px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: '700', letterSpacing: '-0.02em', marginBottom: '12px' }}>
              Frequently Asked Questions
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '15.5px' }}>
              Everything you need to know about AAIA automotive artificial intelligence.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx}
                  style={{
                    background: 'rgba(15, 23, 42, 0.65)',
                    border: isOpen ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    style={{
                      width: '100%',
                      padding: '20px 24px',
                      background: 'transparent',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textAlign: 'left',
                      color: '#ffffff',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={18} color="#38BDF8" /> : <ChevronDown size={18} color="#94a3b8" />}
                  </button>
                  {isOpen && (
                    <div style={{
                      padding: '0 24px 20px',
                      color: '#cbd5e1',
                      fontSize: '14.5px',
                      lineHeight: '1.6',
                      borderTop: '1px solid rgba(255,255,255,0.05)'
                    }}>
                      <p style={{ margin: '14px 0 0' }}>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Ready to Accelerate CTA ──────────────────────────── */}
        <section style={{ 
          padding: '60px 32px', 
          margin: '20px 0 80px',
          background: 'radial-gradient(ellipse at center, rgba(30, 58, 110, 0.45) 0%, rgba(15, 23, 42, 0.8) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '16px',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: 'clamp(24px, 4.5vw, 36px)', fontWeight: '800', marginBottom: '14px' }}>
            Ready to Deploy Automotive Intelligence?
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: '16px', maxWidth: '600px', margin: '0 auto 28px', lineHeight: '1.55' }}>
            Access instant diagnostic reasoning, VIN vehicle records, and computer vision inspections today.
          </p>
          <button
            onClick={() => navigate(user ? '/chat' : '/login')}
            style={{
              padding: '16px 36px',
              background: '#38BDF8',
              color: '#050E1A',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '14px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 10px 25px rgba(56, 189, 248, 0.35)'
            }}
          >
            {user ? 'Open Workspace' : 'Get Started Now'} <ArrowRight size={17} />
          </button>
        </section>

      </main>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer style={{
        position: 'relative', zIndex: 10,
        padding: '30px 24px',
        borderTop: '1px solid rgba(255,255,255,0.08)', 
        background: 'rgba(5, 14, 26, 0.95)'
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/favicon.png" alt="AAIA by Achtrex" style={{ width: '24px', height: '24px' }} />
            <span style={{ fontWeight: '700', fontSize: '15px', color: '#ffffff' }}>AAIA Cognitive Automotive Platform</span>
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', textAlign: 'center', margin: 0 }}>
            &copy; {new Date().getFullYear()} Achtrex LLC. All rights reserved. Powered by AAIA multi-model cognitive reasoning.
          </p>
        </div>
      </footer>
      
    </div>
  );
}
