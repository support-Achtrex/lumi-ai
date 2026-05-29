// src/pages/AnalyticsPage.jsx
import { useState, useEffect } from 'react';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background: 'transparent' }}>
      
      <div style={{ height:64, padding:'0 24px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(255,255,255,0.7)', backdropFilter:'blur(16px)', borderBottom:'1px solid var(--bord)', flexShrink:0, zIndex:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:15, fontWeight:600, color:'var(--dgray)' }}>
          <div style={{ width:36, height:36, background:'linear-gradient(135deg, var(--teal), var(--dblu))', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', boxShadow:'var(--shadow-md)' }}>
            <i className="ti ti-chart-bar" style={{ fontSize:18 }} aria-hidden="true" />
          </div>
          LUMI Platform Analytics
        </div>
        <div className="pill pill-blue">Phase 02: Conversational Analytics</div>
      </div>

      <div style={{ flex:1, padding:24, overflowY:'auto' }}>
        
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height: '100%' }}>
            <div className="loading-dot" style={{ transform: 'scale(1.5)' }} />
          </div>
        ) : (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* Top Stats */}
            <div className="stat-grid">
              <div className="glass-panel" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', right: -20, top: -20, width: 100, height: 100, background: 'var(--teal)', filter: 'blur(50px)', opacity: 0.2 }} />
                <div style={{ fontSize: 12, color: 'var(--mgray)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>API Calls / Month</div>
                <div style={{ fontSize: 36, fontWeight: 700, fontFamily: 'var(--display)', color: 'var(--dgray)' }}>2.4M</div>
                <div style={{ fontSize: 13, color: 'var(--green)', marginTop: 4 }}>+18% vs last month</div>
              </div>
              <div className="glass-panel" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', right: -20, top: -20, width: 100, height: 100, background: 'var(--dblu)', filter: 'blur(50px)', opacity: 0.15 }} />
                <div style={{ fontSize: 12, color: 'var(--mgray)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>Automated Schedules</div>
                <div style={{ fontSize: 36, fontWeight: 700, fontFamily: 'var(--display)', color: 'var(--dgray)' }}>14,209</div>
                <div style={{ fontSize: 13, color: 'var(--sgray)', marginTop: 4 }}>Services booked autonomously</div>
              </div>
              <div className="glass-panel" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', right: -20, top: -20, width: 100, height: 100, background: 'var(--amber)', filter: 'blur(50px)', opacity: 0.15 }} />
                <div style={{ fontSize: 12, color: 'var(--mgray)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>Logic Routing Accuracy</div>
                <div style={{ fontSize: 36, fontWeight: 700, fontFamily: 'var(--display)', color: 'var(--dgray)' }}>96.4%</div>
                <div style={{ fontSize: 13, color: 'var(--green)', marginTop: 4 }}>Alpha testing benchmark</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
              
              {/* Complex Chart area */}
              <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: 16, color: 'var(--dgray)', fontFamily: 'var(--display)', marginBottom: 24 }}>Conversational Analytics Volume</h3>
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 12, height: 200, paddingBottom: 20, borderBottom: '1px solid var(--bord)' }}>
                  {[30, 45, 40, 65, 80, 55, 90, 85, 100, 75, 60, 45, 80, 95].map((val, i) => (
                    <div key={i} style={{ flex: 1, background: `linear-gradient(to top, var(--teal-lt), var(--teal))`, height: `${val}%`, borderRadius: '4px 4px 0 0', position: 'relative', transition: 'height 1s ease-out' }}>
                      <div style={{ position: 'absolute', top: -20, width: '100%', textAlign: 'center', fontSize: 10, color: 'var(--mgray)', opacity: 0, transition: 'opacity 0.2s' }} onMouseOver={e => e.currentTarget.style.opacity = 1} onMouseOut={e => e.currentTarget.style.opacity = 0}>
                        {val}k
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 12, color: 'var(--sgray)' }}>
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
              </div>

              {/* Multi-Model Usage */}
              <div className="glass-panel" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 16, color: 'var(--dgray)', fontFamily: 'var(--display)', marginBottom: 24 }}>Multi-Model Logic Usage</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    { model: 'Predictive Logic Engine', pct: 45, color: 'var(--dblu)' },
                    { model: 'Conversational LLM', pct: 35, color: 'var(--teal)' },
                    { model: 'Damage Vision AI', pct: 15, color: 'var(--amber)' },
                    { model: 'Pricing/TCO Predictor', pct: 5, color: 'var(--mgray)' }
                  ].map(m => (
                    <div key={m.model}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                        <span style={{ fontWeight: 500, color: 'var(--dgray)' }}>{m.model}</span>
                        <span style={{ fontWeight: 600, color: m.color }}>{m.pct}%</span>
                      </div>
                      <div style={{ height: 8, background: 'var(--lgray)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${m.pct}%`, background: m.color, borderRadius: 4 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}
      </div>
    </div>
  );
}
