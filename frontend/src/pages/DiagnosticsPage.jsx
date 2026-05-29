// src/pages/DiagnosticsPage.jsx
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import APIService from '../services/api';

const MOCK_NODES = [
  { id: '1', type: 'symptom', label: 'Engine misfire detected', status: 'active', desc: 'OBD2 Code P0301 (Cylinder 1)' },
  { id: '2', type: 'logic', label: 'Check Ignition Coil', status: 'pending', desc: 'Test resistance and spark output' },
  { id: '3', type: 'logic', label: 'Check Spark Plug', status: 'pending', desc: 'Inspect for fouling or wear' },
  { id: '4', type: 'action', label: 'Replace Coil Pack #1', status: 'recommendation', desc: 'OEM Part #90919-02239' },
];

export default function DiagnosticsPage() {
  const { state } = useLocation();
  const [vin,     setVin]     = useState(state?.vin || 'WA1UAAF41M11122');
  const [loading, setLoading] = useState(false);
  const [tab,     setTab]     = useState('reasoning');

  // Multi-Model Logic Routing Simulation
  const [routingState, setRoutingState] = useState('idle');

  async function startDiagnosticRouting() {
    setLoading(true);
    setRoutingState('analyzing');
    setTimeout(() => { setRoutingState('complete'); setLoading(false); }, 2500);
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background: 'transparent' }}>
      
      {/* Top Bar */}
      <div style={{ height:64, padding:'0 24px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(255,255,255,0.7)', backdropFilter:'blur(16px)', borderBottom:'1px solid var(--bord)', flexShrink:0, zIndex:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:15, fontWeight:600, color:'var(--dgray)' }}>
          <div style={{ width:36, height:36, background:'linear-gradient(135deg, var(--teal), var(--teal-dk))', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', boxShadow:'var(--shadow-md)' }}>
            <i className="ti ti-tool" style={{ fontSize:18 }} aria-hidden="true" />
          </div>
          Intelligent Diagnostics <span className="pill pill-blue">Phase 03 Active</span>
        </div>
        <div style={{ display:'flex', gap:12 }}>
          <input value={vin} onChange={e=>setVin(e.target.value)} placeholder="Vehicle VIN" style={{ width: 220 }} />
          <button className="btn-primary" onClick={startDiagnosticRouting} disabled={loading}>
            {loading ? <span className="loading-dot" /> : <i className="ti ti-cpu" />}
            Run Logic Routing
          </button>
        </div>
      </div>

      <div style={{ flex:1, padding:24, overflowY:'auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Navigation Tabs */}
        <div style={{ display:'flex', gap:8, background:'var(--white)', padding:6, borderRadius:12, width:'fit-content', boxShadow:'var(--shadow-sm)', border:'1px solid var(--bord)' }}>
          {[['reasoning','Reasoning Node Editor'],['probability','Failure Probability'],['recommendation','Smart Repair Actions']].map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)} style={{ 
              height: 32, padding: '0 16px', fontSize: 13, fontWeight: tab === k ? 600 : 500,
              background: tab === k ? 'var(--offwh)' : 'transparent',
              color: tab === k ? 'var(--dblu)' : 'var(--mgray)',
              border: tab === k ? '1px solid var(--bord)' : '1px solid transparent',
              boxShadow: tab === k ? 'var(--shadow-sm)' : 'none'
            }}>{l}</button>
          ))}
        </div>

        {/* Tab Content: Reasoning Node Editor */}
        {tab === 'reasoning' && (
          <div className="glass-panel animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="card-header" style={{ background: 'transparent' }}>
              <h3 style={{ fontSize: 16, color: 'var(--dgray)' }}>Diagnostic Reasoning Node Editor</h3>
              <div className="pill pill-teal">Multi-Model Routing Enabled</div>
            </div>
            <div style={{ flex: 1, padding: 24, position: 'relative', background: 'radial-gradient(circle at center, rgba(10,32,133,0.02) 0%, transparent 70%)' }}>
              
              {/* Background Grid Pattern */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.05, backgroundImage: 'linear-gradient(var(--navy) 1px, transparent 1px), linear-gradient(90deg, var(--navy) 1px, transparent 1px)', backgroundSize: '20px 20px', zIndex: 0 }} />

              <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 40, alignItems: 'center' }}>
                {MOCK_NODES.map((node, i) => (
                  <div key={node.id} style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
                    {/* Node */}
                    <div style={{ 
                      width: 240, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)',
                      border: `1px solid ${node.type === 'action' ? 'var(--teal)' : 'var(--lgray)'}`,
                      borderRadius: 'var(--radius-lg)', padding: 16, boxShadow: 'var(--shadow-md)',
                      position: 'relative'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span className={`pill ${node.type === 'symptom' ? 'pill-red' : node.type === 'action' ? 'pill-teal' : 'pill-blue'}`}>{node.type}</span>
                        {routingState === 'analyzing' && node.type === 'logic' && <span className="loading-dot" />}
                        {routingState === 'complete' && <i className="ti ti-check" style={{ color: 'var(--green)' }} />}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--dgray)', marginBottom: 4 }}>{node.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--mgray)' }}>{node.desc}</div>
                    </div>
                    {/* Connection Line */}
                    {i < MOCK_NODES.length - 1 && (
                      <div style={{ width: 40, height: 2, background: routingState === 'complete' ? 'var(--teal)' : 'var(--bord)', position: 'relative' }}>
                        <div style={{ position: 'absolute', right: -4, top: -3, width: 8, height: 8, borderTop: `2px solid ${routingState === 'complete' ? 'var(--teal)' : 'var(--bord)'}`, borderRight: `2px solid ${routingState === 'complete' ? 'var(--teal)' : 'var(--bord)'}`, transform: 'rotate(45deg)' }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}

        {/* Tab Content: Failure Probability */}
        {tab === 'probability' && (
          <div className="grid3 animate-fade-in" style={{ gap: 20 }}>
            {[['High-Pressure Fuel Pump', 82, 'var(--red)'], ['Timing Chain Tensioner', 45, 'var(--amber)'], ['Water Pump', 12, 'var(--green)']].map(([comp, pct, color]) => (
              <div key={comp} className="glass-panel" style={{ padding: 24 }}>
                <div style={{ fontSize: 13, color: 'var(--mgray)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 16 }}>Component Failure Probability</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--dgray)', marginBottom: 8 }}>{comp}</div>
                
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 16 }}>
                  <div style={{ fontSize: 48, fontWeight: 700, fontFamily: 'var(--display)', color, lineHeight: 0.9 }}>{pct}%</div>
                  <div style={{ fontSize: 13, color: 'var(--sgray)', paddingBottom: 4 }}>Predicted risk</div>
                </div>

                <div style={{ width: '100%', height: 8, background: 'var(--lgray)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 1s ease-out' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab Content: Smart Repair Actions */}
        {tab === 'recommendation' && (
          <div className="glass-panel animate-fade-in" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 18, marginBottom: 20, color: 'var(--dgray)' }}>Smart Repair Recommendations</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { step: 1, action: 'Disconnect battery negative terminal', tools: '10mm socket', time: '5 mins' },
                { step: 2, action: 'Remove engine cover and air intake duct', tools: 'Screwdriver, T25 Torx', time: '10 mins' },
                { step: 3, action: 'Disconnect ignition coil harness', tools: 'None', time: '2 mins' },
                { step: 4, action: 'Extract coil pack #1 and install OEM Part #90919-02239', tools: '10mm socket', time: '15 mins' }
              ].map(rec => (
                <div key={rec.step} style={{ display: 'flex', alignItems: 'center', gap: 20, padding: 16, background: 'var(--white)', border: '1px solid var(--bord)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ width: 40, height: 40, background: 'var(--teal-lt)', color: 'var(--teal-dk)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700 }}>
                    {rec.step}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--dgray)', marginBottom: 4 }}>{rec.action}</div>
                    <div style={{ fontSize: 13, color: 'var(--mgray)' }}><i className="ti ti-tool" /> Tools: {rec.tools}</div>
                  </div>
                  <div className="pill pill-blue">
                    <i className="ti ti-clock" /> {rec.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
