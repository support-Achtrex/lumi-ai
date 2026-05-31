// src/pages/InspectionPage.jsx
import { useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function InspectionPage() {
  const { state } = useLocation();
  const [vin, setVin] = useState(state?.vin || 'WA1UAAF41M11122');
  
  // 'selection' -> 'schema' -> 'processing' -> 'result'
  const [phase, setPhase] = useState('selection');
  const [selectedPart, setSelectedPart] = useState(null);

  const CAR_PARTS = [
    { id: 'fender_fl', label: 'Front Left Fender', icon: 'ti-car' },
    { id: 'bumper_f',  label: 'Front Bumper', icon: 'ti-car-crash' },
    { id: 'door_fl',   label: 'Front Left Door', icon: 'ti-door' },
    { id: 'tyre_fl',   label: 'Front Left Tyre', icon: 'ti-steering-wheel' },
  ];

  function handlePartClick(part) {
    setSelectedPart(part);
    setPhase('schema');
  }

  function handleUpload() {
    setPhase('processing');
    setTimeout(() => {
      setPhase('result');
    }, 4500); // simulate "under 5-minute" deep scan
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background: 'transparent' }}>
      
      {/* Top Bar */}
      <div style={{ height:64, padding:'0 24px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(255,255,255,0.7)', backdropFilter:'blur(16px)', borderBottom:'1px solid var(--bord)', flexShrink:0, zIndex:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:15, fontWeight:600, color:'var(--dgray)' }}>
          <div style={{ width:36, height:36, background:'linear-gradient(135deg, var(--teal), var(--teal-dk))', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', boxShadow:'var(--shadow-md)' }}>
            <i className="ti ti-camera" style={{ fontSize:18 }} aria-hidden="true" />
          </div>
          AI Visual Inspection
          <span className="pill pill-blue">360° Computer Vision</span>
        </div>
        <div style={{ display:'flex', gap:12, alignItems: 'center' }}>
          {state?.vehicleContext && (
            <div style={{ padding: '6px 12px', background: 'var(--teal-lt)', color: 'var(--teal-dk)', borderRadius: 8, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="ti ti-car" /> {state.vehicleContext.year} {state.vehicleContext.make} {state.vehicleContext.model}
            </div>
          )}
          <input value={vin} onChange={e=>setVin(e.target.value)} placeholder="Vehicle VIN" style={{ width: 220 }} />
          {phase === 'result' && (
            <button className="btn-primary" onClick={() => setPhase('selection')}>
              <i className="ti ti-rotate" /> New Inspection
            </button>
          )}
        </div>
      </div>

      <div style={{ flex:1, padding:24, overflowY:'auto', display: 'flex', flexDirection: 'column' }}>
        
        {phase === 'selection' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ textAlign: 'center', margin: '40px 0' }}>
              <h1 style={{ fontSize: 28, fontFamily: 'var(--display)', color: 'var(--dgray)', marginBottom: 12 }}>Select Inspection Zone</h1>
              <p style={{ fontSize: 14, color: 'var(--mgray)' }}>Choose a vehicle component to begin the AI visual assessment.</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 20 }}>
              {CAR_PARTS.map(part => (
                <div key={part.id} className="glass-panel" onClick={() => handlePartClick(part)} style={{ padding: 24, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, transition: 'transform 0.2s, boxShadow 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--teal-lt)', color: 'var(--teal-dk)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                    <i className={`ti ${part.icon}`} />
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--dgray)' }}>{part.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {phase === 'schema' && selectedPart && (
          <div className="animate-fade-in" style={{ display: 'flex', flex: 1, gap: 40, alignItems: 'center', justifyContent: 'center' }}>
            
            {/* Guide Schema */}
            <div className="glass-panel" style={{ padding: 24, width: 400, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <h2 style={{ fontSize: 20, fontFamily: 'var(--display)', color: 'var(--dgray)' }}>Upload {selectedPart.label}</h2>
                <p style={{ fontSize: 13, color: 'var(--mgray)', marginTop: 4 }}>Follow the glowing schema guide to ensure optimal AI assessment accuracy.</p>
              </div>
              
              <div style={{ border: '1px solid var(--bord)', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#000', position: 'relative' }}>
                <img src="/inspection_schema.png" alt="Schema Guide" style={{ width: '100%', display: 'block', opacity: 0.9 }} />
                <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '8px 12px', borderRadius: 8, color: '#fff', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className="ti ti-info-circle" style={{ color: 'var(--teal)' }} /> Ensure the entire highlighted zone is visible.
                </div>
              </div>
            </div>

            {/* Upload Zone */}
            <div style={{ width: 350, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <button className="btn-primary" onClick={handleUpload} style={{ height: 160, display: 'flex', flexDirection: 'column', gap: 12, borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, var(--teal-dk), var(--teal))', boxShadow: '0 12px 32px rgba(0, 229, 193, 0.3)' }}>
                <i className="ti ti-camera" style={{ fontSize: 48 }} />
                <span style={{ fontSize: 16, fontWeight: 600 }}>Use Camera</span>
              </button>
              
              <div style={{ textAlign: 'center', color: 'var(--mgray)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>— OR —</div>
              
              <div onClick={handleUpload} style={{ border: '2px dashed var(--lgray)', borderRadius: 'var(--radius-lg)', padding: 32, textAlign: 'center', background: 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.8)'} onMouseOut={e=>e.currentTarget.style.background='rgba(255,255,255,0.5)'}>
                <i className="ti ti-upload" style={{ fontSize: 32, color: 'var(--mgray)', marginBottom: 12 }} />
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--dgray)', marginBottom: 4 }}>Upload Photo</div>
                <div style={{ fontSize: 12, color: 'var(--sgray)' }}>JPEG, PNG up to 10MB</div>
              </div>
            </div>

          </div>
        )}

        {phase === 'processing' && (
          <div className="animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32 }}>
            <div style={{ position: 'relative', width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Fake processing grid overlay on an image icon */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, border: '1px solid var(--teal)', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ width: '100%', height: '10%', background: 'rgba(0,229,193,0.3)', position: 'absolute', top: 0, animation: 'scan 2s ease-in-out infinite alternate', boxShadow: '0 0 20px var(--teal)' }} />
              </div>
              <i className="ti ti-photo" style={{ fontSize: 64, color: 'var(--teal)' }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: 24, fontFamily: 'var(--display)', color: 'var(--dgray)', marginBottom: 8 }}>360° Computer Vision Processing</h2>
              <p style={{ color: 'var(--mgray)', fontSize: 14, maxWidth: 400 }}>LUMI AI is mapping surface geometry, detecting micro-scratches, and assessing structural integrity. Assessment completing in under 5 minutes...</p>
            </div>
            <style>{`@keyframes scan { from { top: -10%; } to { top: 100%; } }`}</style>
          </div>
        )}

        {phase === 'result' && (
          <div className="animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 24, fontFamily: 'var(--display)', color: 'var(--dgray)' }}>AI Assessment Result</h2>
              <div className="pill pill-red">Damage Detected</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
              
              {/* Original Image with Overlays */}
              <div className="glass-panel" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--mgray)', textTransform: 'uppercase' }}>Processed Scan</div>
                <div style={{ width: '100%', aspectRatio: '16/9', background: '#e5e7eb', borderRadius: 8, position: 'relative', overflow: 'hidden' }}>
                  <img src="/inspection_schema.png" alt="Scan result" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.5)' }} />
                  {/* Bounding box mock */}
                  <div style={{ position: 'absolute', top: '30%', left: '40%', width: '20%', height: '30%', border: '2px solid var(--red)', background: 'rgba(239, 68, 68, 0.2)' }}>
                    <div style={{ position: 'absolute', top: -20, left: -2, background: 'var(--red)', color: '#fff', fontSize: 10, padding: '2px 6px', fontWeight: 600 }}>DENT - 98%</div>
                  </div>
                  <div style={{ position: 'absolute', top: '65%', left: '20%', width: '15%', height: '10%', border: '2px solid var(--amber)', background: 'rgba(245, 158, 11, 0.2)' }}>
                    <div style={{ position: 'absolute', top: -20, left: -2, background: 'var(--amber)', color: '#fff', fontSize: 10, padding: '2px 6px', fontWeight: 600 }}>SCRATCH - 84%</div>
                  </div>
                </div>
              </div>

              {/* Detected Issues */}
              <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--mgray)', textTransform: 'uppercase' }}>Identified Defects</div>
                
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', background: 'var(--white)', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--bord)' }}>
                  <div style={{ width: 48, height: 48, background: 'var(--red-lt)', color: 'var(--red)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                    <i className="ti ti-car-crash" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--dgray)' }}>Moderate Dent (Depth: 4.2mm)</div>
                    <div style={{ fontSize: 13, color: 'var(--mgray)' }}>Located on upper arch. Paint integrity compromised.</div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--sgray)', textAlign: 'right' }}>
                    <div>Confidence</div>
                    <div style={{ fontSize: 16, color: 'var(--dgray)' }}>98.2%</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 16, alignItems: 'center', background: 'var(--white)', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--bord)' }}>
                  <div style={{ width: 48, height: 48, background: 'var(--amber-lt)', color: 'var(--amber)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                    <i className="ti ti-slash" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--dgray)' }}>Surface Scratch (Length: 12cm)</div>
                    <div style={{ fontSize: 13, color: 'var(--mgray)' }}>Clear coat only. Can be buffed out.</div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--sgray)', textAlign: 'right' }}>
                    <div>Confidence</div>
                    <div style={{ fontSize: 16, color: 'var(--dgray)' }}>84.5%</div>
                  </div>
                </div>
                
                <button className="btn-teal" style={{ alignSelf: 'flex-start', marginTop: 8 }}>
                  <i className="ti ti-file-export" /> Generate Repair Estimate
                </button>

              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
