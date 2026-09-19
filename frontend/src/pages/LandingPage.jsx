import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2,
  Gauge,
  Crosshair,
  CircuitBoard,
  Database,
  Sliders,
  Terminal,
  Navigation,
  Car,
  Wrench
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
      icon: <Crosshair size={28} color="#00F0FF" strokeWidth={2.2} />,
      accentColor: '#00F0FF',
      glowBg: 'radial-gradient(circle, rgba(0, 240, 255, 0.25) 0%, rgba(0, 240, 255, 0.04) 70%)',
      title: "Visual AI Damage Scanner",
      description: "Upload vehicle exterior or interior imagery to detect structural deformities, panel dents, micro-scratches, glass stress fractures, and active fluid leaks with neural bounding-box precision."
    },
    {
      icon: <Gauge size={28} color="#A78BFA" strokeWidth={2.2} />,
      accentColor: '#A78BFA',
      glowBg: 'radial-gradient(circle, rgba(167, 139, 250, 0.25) 0%, rgba(167, 139, 250, 0.04) 70%)',
      title: "Predictive Fleet Diagnostics",
      description: "Continuously analyze live sensor telematics to compute real-time vehicle health scores and forecast component degradation cycles well before catastrophic roadside downtime."
    },
    {
      icon: <CircuitBoard size={28} color="#34D399" strokeWidth={2.2} />,
      accentColor: '#34D399',
      glowBg: 'radial-gradient(circle, rgba(52, 211, 153, 0.25) 0%, rgba(52, 211, 153, 0.04) 70%)',
      title: "Conversational Master Mechanic",
      description: "Diagnose complex OBD-II Diagnostic Trouble Codes (DTCs), sensor drift, and intermittent engine faults using multi-model cognitive reasoning and factory OEM service bulletins."
    },
    {
      icon: <Database size={28} color="#FBBF24" strokeWidth={2.2} />,
      accentColor: '#FBBF24',
      glowBg: 'radial-gradient(circle, rgba(251, 191, 36, 0.25) 0%, rgba(251, 191, 36, 0.04) 70%)',
      title: "Deep VIN Intelligence & History",
      description: "Instantly decode 17-digit VINs. Query factory build specifications, salvage history, title brands, open NHTSA safety recalls, and national auction sales data in seconds."
    },
    {
      icon: <Sliders size={28} color="#F43F5E" strokeWidth={2.2} />,
      accentColor: '#F43F5E',
      glowBg: 'radial-gradient(circle, rgba(244, 63, 94, 0.25) 0%, rgba(244, 63, 94, 0.04) 70%)',
      title: "Intelligent Repair Workflows",
      description: "Automate parts procurement matching, standard labor-time estimation, step-by-step mechanical procedures, and direct certified mobile garage dispatch."
    },
    {
      icon: <Terminal size={28} color="#38BDF8" strokeWidth={2.2} />,
      accentColor: '#38BDF8',
      glowBg: 'radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, rgba(56, 189, 248, 0.04) 70%)',
      title: "Developer & Fleet Console",
      description: "Seamlessly integrate cognitive automotive intelligence into your enterprise fleet management system, ERP, or custom mobile application with robust REST endpoints and webhooks."
    }
  ];

  const audiences = [
    {
      icon: <Navigation size={30} color="#00F0FF" strokeWidth={2.2} />,
      accent: '#00F0FF',
      title: "Fleet Operators",
      tagline: "Maximize Uptime & Optimize TCO",
      bullets: [
        "Live predictive vehicle health scores across thousands of assets",
        "Automated preventative maintenance scheduling to avoid breakdowns",
        "Centralized fleet compliance audits and real-time operational telemetry"
      ]
    },
    {
      icon: <Wrench size={30} color="#A78BFA" strokeWidth={2.2} />,
      accent: '#A78BFA',
      title: "Service Centers & Techs",
      tagline: "Faster Turnaround & Precise Root Cause",
      bullets: [
        "Instant OBD-II code resolution linked to OEM service procedures",
        "Visual damage scan documentation for indisputable customer transparency",
        "Accurate factory part number cross-referencing and labor estimation"
      ]
    },
    {
      icon: <Car size={30} color="#34D399" strokeWidth={2.2} />,
      accent: '#34D399',
      title: "Vehicle Owners & Drivers",
      tagline: "Transparent Automotive Intelligence",
      bullets: [
        "Plain-English diagnostic breakdowns for dashboard warning lights",
        "Pre-purchase VIN verification, salvage checks, and structural scans",
        "Instant access to verified mobile mechanics and fair repair estimates"
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
      backgroundColor: '#030712',
      fontFamily: '"Outfit", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      color: '#ffffff'
    }}>
      
      {/* ── Background Video (Crisp & Clearly Visible) ────────────── */}
      <video
        autoPlay
        loop
        muted
        playsInline
        poster="/car_background.png"
        style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          objectFit: 'cover', zIndex: 0, pointerEvents: 'none', 
          opacity: 0.8,
          filter: 'contrast(1.1) brightness(0.85)'
        }}
      >
        <source src="/AAIA_Video.mp4" type="video/mp4" />
      </video>

      {/* ── High-Contrast Directional Overlay ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        background: 'radial-gradient(circle at 50% 30%, rgba(3, 7, 18, 0.42) 0%, rgba(3, 7, 18, 0.72) 60%, rgba(3, 7, 18, 0.94) 100%)',
        zIndex: 1, pointerEvents: 'none'
      }} />

      {/* ── Top Header Navigation ─────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        backdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(3, 7, 18, 0.72)',
        borderBottom: '1px solid rgba(56, 189, 248, 0.15)',
        padding: 'calc(env(safe-area-inset-top, 0px) + 14px) 24px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        maxWidth: '1280px', margin: '0 auto', width: '100%', boxSizing: 'border-box'
      }}>
        {/* Clean Logo & Title (No bounding box or subtitle) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img 
            src="/favicon.png" 
            alt="AAIA Logo" 
            style={{ height: '36px', width: '36px', objectFit: 'contain' }} 
          />
          <span style={{ 
            fontSize: '24px', fontWeight: '800', color: '#ffffff', 
            letterSpacing: '-0.02em', lineHeight: 1
          }}>
            AAIA
          </span>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => navigate(user ? '/chat' : '/login')}
            style={{
              padding: '9px 22px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.05) 100%)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '13.5px',
              fontWeight: '700',
              letterSpacing: '0.04em',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)'
            }}
            onMouseOver={(e) => { 
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 240, 255, 0.25) 0%, rgba(37, 99, 235, 0.25) 100%)'; 
              e.currentTarget.style.borderColor = '#00F0FF';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 240, 255, 0.35)';
            }}
            onMouseOut={(e) => { 
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.05) 100%)'; 
              e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.35)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.4)';
            }}
          >
            {user ? 'Open Dashboard' : 'Sign In'}
          </button>
        </nav>
      </header>

      {/* ── Main Hero Section ──────────────────────────────── */}
      <main style={{ position: 'relative', zIndex: 10, maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        
        <section style={{ 
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '75px 0 85px', textAlign: 'center', position: 'relative'
        }}>
          
          {/* Main H1 Title with Metallic Glow */}
          <h1 style={{ 
            fontSize: 'clamp(34px, 6.2vw, 58px)', 
            fontWeight: '800', 
            letterSpacing: '-0.035em', 
            marginBottom: '22px', 
            lineHeight: 1.15,
            maxWidth: '960px',
            background: 'linear-gradient(180deg, #FFFFFF 20%, #F1F5F9 55%, #38BDF8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.9))'
          }}>
            The Autonomous Reasoning Engine for Automotive Intelligence.
          </h1>

          {/* Subtitle with High-Contrast Text Shadow */}
          <p style={{
            fontSize: 'clamp(16px, 3.6vw, 20px)', 
            color: '#F1F5F9',
            maxWidth: '820px', 
            marginBottom: '38px', 
            lineHeight: '1.65',
            fontWeight: '400',
            textShadow: '0 2px 14px rgba(0,0,0,0.95), 0 4px 28px rgba(0,0,0,0.9)'
          }}>
            Bridging the gap between real-time vehicle telemetry, computer vision damage scanning, predictive fleet maintenance, and certified mobile repair.
          </p>

          {/* Clean, Sleek Feature Highlights (No Box Borders, No Symbols) */}
          <div style={{ 
            display: 'flex', gap: '10px 24px', flexWrap: 'wrap', justifyContent: 'center',
            marginBottom: '46px', alignItems: 'center',
            fontSize: '13.5px', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase'
          }}>
            <span style={{ color: '#F1F5F9', textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}>Live Telematics Stream</span>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>•</span>
            <span style={{ color: '#F1F5F9', textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}>Predictive Diagnostics</span>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>•</span>
            <span style={{ color: '#F1F5F9', textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}>Diagnostic Reasoning</span>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>•</span>
            <span style={{ color: '#F1F5F9', textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}>Vision Damage AI</span>
          </div>
          
          {/* Primary Action Button - Cyber Electric Styling */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button 
              onClick={() => navigate(user ? '/chat' : '/login')}
              style={{
                padding: '16px 44px',
                background: 'linear-gradient(135deg, #00F0FF 0%, #0284C7 100%)',
                color: '#030816',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '14.5px',
                fontWeight: '800',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                transition: 'all 0.25s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                boxShadow: '0 0 28px rgba(0, 240, 255, 0.45), 0 10px 25px rgba(0, 0, 0, 0.6)'
              }}
              onMouseOver={(e) => { 
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; 
                e.currentTarget.style.boxShadow = '0 0 40px rgba(0, 240, 255, 0.7), 0 14px 30px rgba(0, 0, 0, 0.7)';
              }}
              onMouseOut={(e) => { 
                e.currentTarget.style.transform = 'translateY(0) scale(1)'; 
                e.currentTarget.style.boxShadow = '0 0 28px rgba(0, 240, 255, 0.45), 0 10px 25px rgba(0, 0, 0, 0.6)';
              }}
            >
              {user ? 'Enter Dashboard' : 'Launch Workspace'} <ArrowRight size={18} strokeWidth={2.5} />
            </button>
          </div>

        </section>

        {/* ── Feature Capabilities Grid ────────────────────────── */}
        <section style={{ 
          padding: '70px 0 80px', 
          borderTop: '1px solid rgba(56, 189, 248, 0.15)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <h2 style={{ 
              fontSize: 'clamp(26px, 4.5vw, 40px)', fontWeight: '800', 
              letterSpacing: '-0.025em', marginBottom: '14px',
              textShadow: '0 2px 14px rgba(0,0,0,0.9)'
            }}>
              Engineered for Cognitive Vehicle Precision
            </h2>
            <p style={{ 
              color: '#cbd5e1', fontSize: '16.5px', maxWidth: '680px', margin: '0 auto',
              textShadow: '0 2px 8px rgba(0,0,0,0.8)'
            }}>
              Harnessing multi-modal neural networks, live telematics ingestion, and automated repair pipelines.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '24px'
          }}>
            {features.map((feature, idx) => (
              <article 
                key={idx}
                style={{
                  background: 'rgba(6, 13, 27, 0.82)',
                  border: '1px solid rgba(56, 189, 248, 0.16)',
                  backdropFilter: 'blur(16px)',
                  borderRadius: '16px',
                  padding: '32px 30px',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.25s ease',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.55)'
                }}
                onMouseOver={(e) => { 
                  e.currentTarget.style.borderColor = feature.accentColor; 
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 14px 36px rgba(0, 0, 0, 0.7), 0 0 25px ${feature.accentColor}33`;
                }}
                onMouseOut={(e) => { 
                  e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.16)'; 
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.55)';
                }}
              >
                {/* Fully Rounded Circular Icon Container */}
                <div style={{ 
                  width: '60px', height: '60px', borderRadius: '50%', 
                  background: feature.glowBg,
                  border: `1.5px solid ${feature.accentColor}55`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 0 24px ${feature.accentColor}28`,
                  marginBottom: '22px'
                }}>
                  {feature.icon}
                </div>

                <h3 style={{ 
                  fontSize: '20px', fontWeight: '700', marginBottom: '12px', color: '#ffffff',
                  letterSpacing: '-0.02em'
                }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: '14.5px', color: '#94a3b8', lineHeight: '1.65', margin: 0 }}>
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* ── Target Stakeholders / Personas ──────────────────── */}
        <section style={{ 
          padding: '70px 0 80px', 
          borderTop: '1px solid rgba(56, 189, 248, 0.15)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <h2 style={{ 
              fontSize: 'clamp(26px, 4.5vw, 40px)', fontWeight: '800', 
              letterSpacing: '-0.025em', marginBottom: '14px',
              textShadow: '0 2px 14px rgba(0,0,0,0.9)'
            }}>
              Built for Every Automotive Stakeholder
            </h2>
            <p style={{ 
              color: '#cbd5e1', fontSize: '16.5px', maxWidth: '640px', margin: '0 auto',
              textShadow: '0 2px 8px rgba(0,0,0,0.8)'
            }}>
              Tailored AI workspaces for commercial enterprises, repair technicians, and everyday car owners.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {audiences.map((aud, idx) => (
              <div 
                key={idx}
                style={{
                  background: 'linear-gradient(180deg, rgba(8, 17, 34, 0.88) 0%, rgba(4, 9, 20, 0.94) 100%)',
                  border: '1px solid rgba(56, 189, 248, 0.18)',
                  backdropFilter: 'blur(16px)',
                  borderRadius: '16px',
                  padding: '32px',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.6)'
                }}
              >
                {/* Fully Rounded Circular Icon Container */}
                <div style={{ 
                  width: '64px', height: '64px', borderRadius: '50%',
                  background: `${aud.accent}18`, 
                  border: `1.5px solid ${aud.accent}55`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '22px', 
                  boxShadow: `0 0 24px ${aud.accent}28`
                }}>
                  {aud.icon}
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '6px', color: '#ffffff' }}>{aud.title}</h3>
                <div style={{ fontSize: '13.5px', color: aud.accent, fontWeight: '700', marginBottom: '22px', letterSpacing: '0.02em' }}>{aud.tagline}</div>
                <ul style={{ paddingLeft: '0', listStyle: 'none', margin: '0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {aud.bullets.map((b, bIdx) => (
                    <li key={bIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '14px', color: '#cbd5e1', lineHeight: '1.55' }}>
                      <CheckCircle2 size={17} color={aud.accent} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── Interactive FAQ Section ──────────────────────────── */}
        <section style={{ 
          padding: '70px 0 80px', 
          borderTop: '1px solid rgba(56, 189, 248, 0.15)', 
          maxWidth: '880px', 
          margin: '0 auto' 
        }}>
          <div style={{ textAlign: 'center', marginBottom: '44px' }}>
            <h2 style={{ 
              fontSize: 'clamp(26px, 4.5vw, 38px)', fontWeight: '800', 
              letterSpacing: '-0.025em', marginBottom: '12px',
              textShadow: '0 2px 14px rgba(0,0,0,0.9)'
            }}>
              Frequently Asked Questions
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '16px', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
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
                    background: 'rgba(6, 13, 27, 0.82)',
                    border: isOpen ? '1px solid #00F0FF' : '1px solid rgba(56, 189, 248, 0.16)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(16px)',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                    boxShadow: isOpen ? '0 0 25px rgba(0, 240, 255, 0.15)' : 'none'
                  }}
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    style={{
                      width: '100%',
                      padding: '22px 26px',
                      background: 'transparent',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textAlign: 'left',
                      color: '#ffffff',
                      fontSize: '16.5px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={20} color="#00F0FF" /> : <ChevronDown size={20} color="#94a3b8" />}
                  </button>
                  {isOpen && (
                    <div style={{
                      padding: '0 26px 22px',
                      color: '#cbd5e1',
                      fontSize: '15px',
                      lineHeight: '1.65',
                      borderTop: '1px solid rgba(255,255,255,0.06)'
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
          padding: '65px 36px', 
          margin: '20px 0 80px',
          background: 'radial-gradient(ellipse at center, rgba(14, 38, 77, 0.85) 0%, rgba(4, 9, 20, 0.94) 100%)',
          border: '1px solid rgba(0, 240, 255, 0.35)',
          borderRadius: '20px',
          textAlign: 'center',
          boxShadow: '0 0 45px rgba(0, 240, 255, 0.15), 0 20px 50px rgba(0, 0, 0, 0.7)'
        }}>
          <h2 style={{ 
            fontSize: 'clamp(26px, 4.8vw, 42px)', fontWeight: '800', marginBottom: '14px',
            letterSpacing: '-0.025em',
            background: 'linear-gradient(180deg, #FFFFFF 20%, #F1F5F9 55%, #38BDF8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Ready to Deploy Automotive Intelligence?
          </h2>
          <p style={{ 
            color: '#E2E8F0', fontSize: '17px', maxWidth: '640px', margin: '0 auto 32px', lineHeight: '1.6',
            textShadow: '0 2px 10px rgba(0,0,0,0.8)'
          }}>
            Access instant diagnostic reasoning, VIN vehicle records, and computer vision inspections today.
          </p>
          <button
            onClick={() => navigate(user ? '/chat' : '/login')}
            style={{
              padding: '16px 42px',
              background: 'linear-gradient(135deg, #00F0FF 0%, #0284C7 100%)',
              color: '#030816',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '800',
              fontSize: '14.5px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 0 30px rgba(0, 240, 255, 0.45), 0 10px 25px rgba(0, 0, 0, 0.6)',
              transition: 'all 0.25s ease'
            }}
            onMouseOver={(e) => { 
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; 
              e.currentTarget.style.boxShadow = '0 0 42px rgba(0, 240, 255, 0.75), 0 14px 30px rgba(0, 0, 0, 0.7)';
            }}
            onMouseOut={(e) => { 
              e.currentTarget.style.transform = 'translateY(0) scale(1)'; 
              e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 240, 255, 0.45), 0 10px 25px rgba(0, 0, 0, 0.6)';
            }}
          >
            {user ? 'Open Workspace' : 'Get Started Now'} <ArrowRight size={18} strokeWidth={2.5} />
          </button>
        </section>

      </main>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer style={{
        position: 'relative', zIndex: 10,
        padding: '36px 24px',
        borderTop: '1px solid rgba(56, 189, 248, 0.15)', 
        background: 'rgba(3, 7, 18, 0.96)'
      }}>
        <div style={{
          maxWidth: '1280px', margin: '0 auto',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/favicon.png" alt="AAIA by Achtrex" style={{ width: '26px', height: '26px' }} />
            <span style={{ fontWeight: '800', fontSize: '16px', color: '#ffffff', letterSpacing: '-0.01em' }}>
              AAIA Cognitive Automotive Platform
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', margin: 0 }}>
            &copy; {new Date().getFullYear()} Achtrex LLC. All rights reserved. Powered by AAIA multi-model cognitive reasoning.
          </p>
        </div>
      </footer>
      
    </div>
  );
}
