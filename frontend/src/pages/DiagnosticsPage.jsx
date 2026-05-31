// src/pages/DiagnosticsPage.jsx
import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import APIService from '../services/api';
import ReactMarkdown from 'react-markdown';

export default function DiagnosticsPage() {
  const { state } = useLocation();
  const [vin, setVin] = useState(state?.vin || '');
  
  // 'input' -> 'analyzing' -> 'results'
  const [phase, setPhase] = useState('input');
  
  const [obdCode, setObdCode] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      
      rec.onresult = (event) => {
        let transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setSymptoms(transcript);
      };

      rec.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      setRecognition(rec);
    }
  }, []);

  const [nodes, setNodes] = useState([]);
  const [dtcDefinition, setDtcDefinition] = useState('');
  const [detailedSummary, setDetailedSummary] = useState('');
  const [assessmentText, setAssessmentText] = useState('');
  const [assessmentMode, setAssessmentMode] = useState(false);
  

  const [tab, setTab] = useState('reasoning');
  const [routingState, setRoutingState] = useState('idle'); // For node editor animation

  async function handleStartDiagnosis() {
    setPhase('analyzing');
    try {
      if (image) {
        setAssessmentMode(true);
        const res = await APIService.assessDamage(symptoms || 'Visual assessment', vin, '', image);
        setAssessmentText(res.assessment || 'No assessment generated.');
      } else {
        setAssessmentMode(false);
        const res = await APIService.getDiagnosticReasoning(symptoms || obdCode, vin, obdCode ? [obdCode] : []);
        setNodes(res.nodes || []);
        setDtcDefinition(res.dtcDefinition || '');
        setDetailedSummary(res.detailedSummary || '');
      }
      setPhase('results');
      setRoutingState('analyzing');
      setTimeout(() => setRoutingState('complete'), 1000);
    } catch (err) {
      console.error(err);
      alert('Failed to generate diagnostic.');
      setPhase('input');
    }
  }

  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImage(ev.target.result);
    reader.readAsDataURL(file);
  }

  function handleMicToggle() {
    if (isRecording) {
      if (recognition) recognition.stop();
      setIsRecording(false);
    } else {
      if (recognition) {
        setSymptoms('');
        try {
          recognition.start();
          setIsRecording(true);
        } catch(e) {
          console.error(e);
        }
      } else {
        alert('Speech recognition is not supported in this browser.');
      }
    }
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background: 'transparent' }}>
      
      {/* Top Bar */}
      <div style={{ height:64, padding:'0 24px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(255,255,255,0.7)', backdropFilter:'blur(16px)', borderBottom:'1px solid var(--bord)', flexShrink:0, zIndex:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:15, fontWeight:600, color:'var(--dgray)' }}>
          <div style={{ width:36, height:36, background:'linear-gradient(135deg, var(--teal), var(--teal-dk))', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', boxShadow:'var(--shadow-md)' }}>
            <i className="ti ti-tool" style={{ fontSize:18 }} aria-hidden="true" />
          </div>
          Intelligent Diagnostics
          {phase === 'results' && <span className="pill pill-blue">Phase 03 Active</span>}
        </div>
        <div style={{ display:'flex', gap:12, alignItems: 'center' }}>
          {state?.vehicleContext && (
            <div style={{ padding: '6px 12px', background: 'var(--teal-lt)', color: 'var(--teal-dk)', borderRadius: 8, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="ti ti-car" /> {state.vehicleContext.year} {state.vehicleContext.make} {state.vehicleContext.model}
            </div>
          )}
          <input value={vin} onChange={e=>setVin(e.target.value)} placeholder="Vehicle VIN" style={{ width: 220 }} />
          {phase === 'results' && (
            <button className="btn-primary" onClick={() => { setRoutingState('idle'); setTimeout(() => setRoutingState('analyzing'), 100); setTimeout(() => setRoutingState('complete'), 2500); }}>
              <i className="ti ti-cpu" /> Rerun Logic
            </button>
          )}
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', display: 'flex', flexDirection: 'column' }}>
        
        {phase === 'input' && (
          <div className="animate-fade-in" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
            <div style={{ maxWidth: 800, width: '100%', display: 'flex', flexDirection: 'column', gap: 32 }}>
              
              <div style={{ textAlign: 'center' }}>
                <h1 style={{ fontSize: 32, fontFamily: 'var(--display)', color: 'var(--dgray)', marginBottom: 12 }}>How can LUMI help diagnose?</h1>
                <p style={{ fontSize: 15, color: 'var(--mgray)' }}>Provide an OBD2 Trouble Code or describe the symptoms the vehicle is experiencing.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 24 }}>
                
                {/* Trouble Code Input */}
                <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--dblu)', fontWeight: 600 }}>
                    <i className="ti ti-plug" style={{ fontSize: 20 }} /> Scan Tool Code
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--mgray)', lineHeight: 1.5 }}>Enter the exact Diagnostic Trouble Code (DTC) retrieved from your scanner.</p>
                  <input 
                    value={obdCode} onChange={e => setObdCode(e.target.value.toUpperCase())}
                    placeholder="e.g. P0301" 
                    style={{ height: 48, fontSize: 16, textAlign: 'center', letterSpacing: '2px', textTransform: 'uppercase', border: '2px dashed var(--lgray)' }} 
                  />
                </div>

                {/* Natural Language Input */}
                <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--teal-dk)', fontWeight: 600 }}>
                      <i className="ti ti-messages" style={{ fontSize: 20 }} /> Natural Language Symptoms
                    </div>
                    <button onClick={handleMicToggle} style={{ background: isRecording ? 'var(--red-lt)' : 'var(--offwh)', border: 'none', color: isRecording ? 'var(--red)' : 'var(--dgray)', width: 36, height: 36, padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="ti ti-microphone" style={{ fontSize: 18 }} />
                    </button>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--mgray)', lineHeight: 1.5 }}>Describe what you hear, feel, or see. LUMI's NLP will extract the mechanical context automatically.</p>
                  <div style={{ position: 'relative' }}>
                    <textarea 
                      value={symptoms} onChange={e => setSymptoms(e.target.value)}
                      placeholder="e.g. The engine shakes violently when accelerating past 40mph... Or provide damage description." 
                      style={{ width: '100%', height: 120, padding: 16, resize: 'none', paddingBottom: image ? 40 : 16 }} 
                    />
                    {image && (
                      <div style={{ position: 'absolute', bottom: 12, left: 12, display: 'flex', alignItems: 'center', gap: 6, background: 'var(--offwh)', padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, color: 'var(--dgray)' }}>
                        <i className="ti ti-photo" /> Image Attached <button onClick={() => setImage(null)} style={{ background: 'transparent', border: 'none', color: 'var(--red)', cursor: 'pointer', padding: 0, marginLeft: 4 }}><i className="ti ti-x" /></button>
                      </div>
                    )}
                    {isRecording && <div style={{ position: 'absolute', bottom: 16, right: 16, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--red)', fontWeight: 600 }}><span className="loading-dot" style={{ background: 'var(--red)' }}/> Listening...</div>}
                  </div>

                  {/* Image Upload Button */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImageUpload} />
                    <button className="btn-secondary" onClick={() => fileInputRef.current?.click()} style={{ fontSize: 13, height: 32 }}>
                      <i className="ti ti-camera" /> Upload Photo for Vision Analysis
                    </button>
                  </div>
                </div>

              </div>

              <button className="btn-teal" onClick={handleStartDiagnosis} disabled={!obdCode && !symptoms && !image} style={{ height: 56, fontSize: 16, alignSelf: 'center', padding: '0 40px', borderRadius: 28, boxShadow: '0 8px 24px rgba(0, 229, 193, 0.3)' }}>
                <i className="ti ti-cpu" style={{ fontSize: 20 }} /> Initiate Cognitive Diagnosis
              </button>

            </div>
          </div>
        )}

        {phase === 'analyzing' && (
          <div className="animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
            <div style={{ position: 'relative', width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', width: '100%', height: '100%', border: '4px solid var(--teal-lt)', borderRadius: '50%', borderTopColor: 'var(--teal)', animation: 'spin 1s linear infinite' }} />
              <div style={{ position: 'absolute', width: '70%', height: '70%', border: '4px solid rgba(10,32,133,0.1)', borderRadius: '50%', borderBottomColor: 'var(--dblu)', animation: 'spin 1.5s linear infinite reverse' }} />
              <i className="ti ti-brain" style={{ fontSize: 40, color: 'var(--dgray)' }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: 24, fontFamily: 'var(--display)', color: 'var(--dgray)', marginBottom: 8 }}>Parsing Diagnostic Logic...</h2>
              <p style={{ color: 'var(--mgray)', fontSize: 14 }}>Correlating symptoms against 4M+ historical service records.</p>
            </div>
          </div>
        )}

        {phase === 'results' && (
          <div className="animate-fade-in" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24, flex: 1 }}>
            
            {/* Input Summary */}
            <div className="glass-panel" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 32 }}>
                {obdCode && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--mgray)', textTransform: 'uppercase', marginBottom: 4 }}>DTC</div>
                    <div className="pill pill-red" style={{ fontSize: 14, letterSpacing: '1px' }}>{obdCode}</div>
                  </div>
                )}
                {symptoms && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--mgray)', textTransform: 'uppercase', marginBottom: 4 }}>Extracted Context</div>
                    <div style={{ fontSize: 14, color: 'var(--dgray)' }}>"{symptoms}"</div>
                  </div>
                )}
              </div>
              <button onClick={() => {setPhase('input'); setAssessmentMode(false); setNodes([]); setDtcDefinition(''); setDetailedSummary(''); setAssessmentText(''); setImage(null); setObdCode(''); setSymptoms('');}} style={{ background: 'transparent', border: '1px solid var(--bord)', color: 'var(--mgray)', boxShadow: 'none' }}>Modify Input</button>
            </div>

            {dtcDefinition && (
              <div className="glass-panel animate-fade-in" style={{ padding: 24, marginTop: 16 }}>
                <h3 style={{ fontSize: 16, color: 'var(--dgray)', marginBottom: 8, fontFamily: 'var(--display)' }}>DTC Definition</h3>
                <div style={{ fontSize: 15, color: 'var(--teal-dk)', fontWeight: 600 }}>{dtcDefinition}</div>
              </div>
            )}
            {detailedSummary && (
              <div className="glass-panel animate-fade-in" style={{ padding: 24, marginTop: 16 }}>
                <h3 style={{ fontSize: 16, color: 'var(--dgray)', marginBottom: 8, fontFamily: 'var(--display)' }}>Diagnostic Summary</h3>
                <div style={{ fontSize: 14, color: 'var(--mgray)', lineHeight: 1.6 }}>{detailedSummary}</div>
              </div>
            )}

            {assessmentMode ? (
              <div className="glass-panel animate-fade-in markdown-content" style={{ padding: 32, flex: 1, overflowY: 'auto', background: 'var(--white)' }}>
                <div style={{ display: 'flex', gap: 24 }}>
                  {image && (
                    <div style={{ width: 200, flexShrink: 0 }}>
                      <img src={image} alt="Uploaded" style={{ width: '100%', borderRadius: 8, border: '1px solid var(--bord)' }} />
                    </div>
                  )}
                  <div style={{ flex: 1, lineHeight: 1.6, color: 'var(--dgray)' }}>
                    <ReactMarkdown>{assessmentText}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Navigation Tabs */}
            <div style={{ display:'flex', gap:8, background:'var(--white)', padding:6, borderRadius:12, width:'fit-content', boxShadow:'var(--shadow-sm)', border:'1px solid var(--bord)' }}>
              {[['reasoning','Reasoning Node Editor'],['recommendation','Action Plan']].map(([k,l]) => (
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
              <div className="glass-panel animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 400 }}>
                <div className="card-header" style={{ background: 'transparent' }}>
                  <h3 style={{ fontSize: 16, color: 'var(--dgray)' }}>Diagnostic Reasoning Node Editor</h3>
                  <div className="pill pill-teal">Multi-Model Routing Enabled</div>
                </div>
                <div style={{ flex: 1, padding: 24, position: 'relative', background: 'radial-gradient(circle at center, rgba(10,32,133,0.02) 0%, transparent 70%)' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.05, backgroundImage: 'linear-gradient(var(--navy) 1px, transparent 1px), linear-gradient(90deg, var(--navy) 1px, transparent 1px)', backgroundSize: '20px 20px', zIndex: 0 }} />
                  <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 40, alignItems: 'center', overflowX: 'auto', paddingBottom: 20 }}>
                    {nodes.map((node, i) => (
                      <div key={node.id || i} style={{ display: 'flex', alignItems: 'center', gap: 40, flexShrink: 0 }}>
                        <div style={{ 
                          width: 280, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)',
                          border: `1px solid ${node.type === 'repair_action' ? 'var(--teal)' : 'var(--lgray)'}`,
                          borderRadius: 'var(--radius-lg)', padding: 16, boxShadow: 'var(--shadow-md)', position: 'relative'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span className={`pill ${node.type === 'diagnostic_step' ? 'pill-blue' : node.type === 'repair_action' ? 'pill-teal' : 'pill-amber'}`}>{node?.type?.replace('_', ' ')}</span>
                            {routingState === 'analyzing' && node.type === 'diagnostic_step' && <span className="loading-dot" />}
                            {routingState === 'complete' && <i className="ti ti-check" style={{ color: 'var(--green)' }} />}
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--dgray)', marginBottom: 4 }}>{node.title}</div>
                          <div style={{ fontSize: 12, color: 'var(--mgray)' }}>{node.description}</div>
                        </div>
                        {i < nodes.length - 1 && (
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

            {/* Tab Content: Action Plan */}
            {tab === 'recommendation' && (
              <div className="glass-panel animate-fade-in" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 18, marginBottom: 20, color: 'var(--dgray)' }}>Recommended Action Plan</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {nodes.map((rec, idx) => (
                    <div key={rec.id || idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 20, padding: 16, background: 'var(--white)', border: '1px solid var(--bord)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ width: 40, height: 40, background: 'var(--teal-lt)', color: 'var(--teal-dk)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, flexShrink: 0 }}>
                        {idx + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--dgray)' }}>{rec.title}</div>
                          <span className={`pill ${rec?.type?.includes('repair') ? 'pill-teal' : rec?.type?.includes('verify') ? 'pill-amber' : 'pill-blue'}`} style={{ fontSize: 10, padding: '2px 6px' }}>
                            {rec?.type?.replace('_', ' ')}
                          </span>
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--sgray)', marginTop: 4, marginBottom: 8, lineHeight: 1.5 }}>{rec.description}</div>
                        {(rec.requiredTools && rec.requiredTools.length > 0) && (
                          <div style={{ fontSize: 13, color: 'var(--mgray)' }}><i className="ti ti-tool" /> Tools: {rec.requiredTools.join(', ')}</div>
                        )}
                      </div>
                      <div className="pill pill-blue" style={{ flexShrink: 0 }}>
                        <i className="ti ti-clock" /> {rec.estimatedTime || 'N/A'}
                      </div>
                    </div>
                  ))}
                  {nodes.length === 0 && (
                    <div style={{ padding: 24, textAlign: 'center', color: 'var(--mgray)', fontSize: 14 }}>
                      No specific actions generated yet. Please generate a diagnostic.
                    </div>
                  )}
                </div>
              </div>
            )}
            </>
            )}
            
          </div>
        )}

      </div>
    </div>
  );
}
