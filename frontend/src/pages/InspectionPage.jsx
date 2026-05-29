// src/pages/InspectionPage.jsx
import { useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function InspectionPage() {
  const { state } = useLocation();
  const [vin, setVin] = useState(state?.vin || 'WA1UAAF41M11122');
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [translationResult, setTranslationResult] = useState(null);

  function toggleRecording() {
    if (isRecording) {
      setIsRecording(false);
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setTranslationResult({
          text: transcript,
          issues: [
            { component: 'Front Left Tyre', status: 'fail', detail: 'Tread depth below 2mm, uneven wear detected.' },
            { component: 'Brake Pads', status: 'warn', detail: 'Squeaking noise reported, 4mm pad remaining.' }
          ]
        });
      }, 1500);
    } else {
      setIsRecording(true);
      setTranscript('');
      setTranslationResult(null);
      // Mock typing effect for voice dictation
      let text = "I'm inspecting the Audi Q5. The front left tyre tread is completely worn out on the inner edge. Also hearing a squeak from the brakes when stopping.";
      let i = 0;
      const interval = setInterval(() => {
        setTranscript(prev => prev + text[i]);
        i++;
        if (i >= text.length) clearInterval(interval);
      }, 50);
    }
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background: 'transparent' }}>
      
      {/* Top Bar */}
      <div style={{ height:64, padding:'0 24px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(255,255,255,0.7)', backdropFilter:'blur(16px)', borderBottom:'1px solid var(--bord)', flexShrink:0, zIndex:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:15, fontWeight:600, color:'var(--dgray)' }}>
          <div style={{ width:36, height:36, background:'linear-gradient(135deg, var(--teal), var(--teal-dk))', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', boxShadow:'var(--shadow-md)' }}>
            <i className="ti ti-microphone" style={{ fontSize:18 }} aria-hidden="true" />
          </div>
          Inspection & Alpha Audit
        </div>
        <div style={{ display:'flex', gap:12 }}>
          <input value={vin} onChange={e=>setVin(e.target.value)} placeholder="Vehicle VIN" style={{ width: 220 }} />
        </div>
      </div>

      <div style={{ flex:1, padding:24, overflowY:'auto', display: 'flex', gap: 24 }}>
        
        {/* Left Column: Voice to Diagnostic */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <h3 style={{ fontSize: 18, color: 'var(--dgray)', fontFamily: 'var(--display)' }}>Voice-to-Diagnostic Translation</h3>
          <div className="glass-panel animate-fade-in" style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.5)', border: '1px solid var(--bord)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 20, minHeight: 150, fontSize: 14, color: 'var(--dgray)', lineHeight: 1.6 }}>
              {transcript || <span style={{ color: 'var(--sgray)' }}>Press record and describe the vehicle condition...</span>}
              {isRecording && <span className="loading-dot" style={{ marginLeft: 8 }} />}
            </div>

            <button className={isRecording ? "btn-primary" : "btn-teal"} onClick={toggleRecording} style={{ alignSelf: 'center', height: 48, borderRadius: 24, padding: '0 24px', fontSize: 14 }}>
              {isRecording ? <><i className="ti ti-square" /> Stop Recording</> : <><i className="ti ti-microphone" /> Start Voice Audit</>}
            </button>

            {loading && (
              <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--mgray)', justifyContent: 'center' }}>
                <span className="loading-dot" /> LUMI AI is translating natural language to diagnostic routing...
              </div>
            )}

            {translationResult && (
              <div style={{ marginTop: 24, animation: 'fadeIn 0.4s' }}>
                <h4 style={{ fontSize: 14, marginBottom: 12, color: 'var(--dgray)' }}>LUMI AI Structured Output:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {translationResult.issues.map((issue, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 16, alignItems: 'center', background: 'var(--white)', padding: 12, borderRadius: 'var(--radius-md)', border: '1px solid var(--bord)', boxShadow: 'var(--shadow-sm)' }}>
                      <span className={`pill ${issue.status === 'fail' ? 'pill-red' : 'pill-amber'}`}>{issue.status.toUpperCase()}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--dgray)' }}>{issue.component}</div>
                        <div style={{ fontSize: 13, color: 'var(--mgray)' }}>{issue.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right Column: Alpha Testing Summaries */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <h3 style={{ fontSize: 18, color: 'var(--dgray)', fontFamily: 'var(--display)' }}>Phase 04 Alpha Testing Metrics</h3>
          
          <div className="glass-panel animate-fade-in" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: 'var(--mgray)', fontWeight: 600, textTransform: 'uppercase' }}>Routing Accuracy</div>
              <span className="pill pill-green">Target: 95%</span>
            </div>
            <div style={{ fontSize: 48, fontWeight: 700, fontFamily: 'var(--display)', color: 'var(--teal-dk)', marginBottom: 8 }}>96.4%</div>
            <div style={{ fontSize: 13, color: 'var(--sgray)' }}>Based on 14,208 historical service records analyzed during the current alpha testing phase.</div>
            
            <div style={{ marginTop: 24, height: 160, display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              {/* Mock Bar Chart */}
              {[40, 55, 68, 75, 82, 89, 96.4].map((val, i) => (
                <div key={i} style={{ flex: 1, background: i === 6 ? 'var(--teal)' : 'var(--lgray)', height: `${val}%`, borderRadius: '4px 4px 0 0', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: -20, width: '100%', textAlign: 'center', fontSize: 10, color: 'var(--mgray)' }}>{val}%</div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel animate-fade-in" style={{ padding: 24 }}>
            <h4 style={{ fontSize: 14, marginBottom: 16, color: 'var(--dgray)' }}>Alpha Audit Logs</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 12, display: 'flex', gap: 12, paddingBottom: 8, borderBottom: '1px dashed var(--lgray)' }}>
                <span style={{ color: 'var(--teal)' }}>[10:42 AM]</span>
                <span style={{ color: 'var(--mgray)' }}>Engine logic model re-calibrated. Accuracy +0.8%</span>
              </div>
              <div style={{ fontSize: 12, display: 'flex', gap: 12, paddingBottom: 8, borderBottom: '1px dashed var(--lgray)' }}>
                <span style={{ color: 'var(--teal)' }}>[09:15 AM]</span>
                <span style={{ color: 'var(--mgray)' }}>Stress test completed on 2M telemetry rows. No latency.</span>
              </div>
              <div style={{ fontSize: 12, display: 'flex', gap: 12 }}>
                <span style={{ color: 'var(--teal)' }}>[08:01 AM]</span>
                <span style={{ color: 'var(--mgray)' }}>New LLM endpoints hooked for Conversational Analytics.</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
