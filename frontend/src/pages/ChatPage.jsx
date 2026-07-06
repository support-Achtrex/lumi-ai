// src/pages/ChatPage.jsx
import { useState, useRef, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import APIService from '../services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function TCOCard({ data }) {
  if (!data) return null;
  return (
    <div className="animate-slide-up" style={{ fontFamily:'Inter, sans-serif', color:'#1C2B3A', marginBottom:16, marginTop:8 }}>
      <div style={{ display:'flex', gap:8, marginBottom:16 }}>
        <span style={{ background:'#E1F5EE', color:'#0F6E56', padding:'4px 8px', borderRadius:6, fontSize:12, fontWeight:600, display:'flex', alignItems:'center', gap:4 }}>
          <i className="ti ti-car" /> {data.vin || 'VIN N/A'}
        </span>
        <span style={{ background:'#E8F0FE', color:'#0D2FA3', padding:'4px 8px', borderRadius:6, fontSize:12, fontWeight:500 }}>
          {data.vehicle || 'Vehicle'}
        </span>
      </div>
      <p style={{ margin:'0 0 16px 0', fontSize:14, color:'#1C2B3A', fontWeight:500 }}>Here is the 5-year total cost of ownership breakdown for your vehicle:</p>
      <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:16 }}>
        {['Depreciation', 'Fuel', 'Maintenance'].map(k => (
          <div key={k} style={{ background:'#fff', border:'1px solid #E0E0E0', padding:'8px 12px', borderRadius:8, fontSize:13, display:'flex', gap:6, boxShadow:'0 1px 2px rgba(0,0,0,0.02)' }}>
            <span style={{ color:'#607D8B' }}>{k}</span> <strong style={{ color:'#1C2B3A' }}>${data[k.toLowerCase()]?.toLocaleString() || data[k.toLowerCase()]}</strong>
          </div>
        ))}
        <div style={{ background:'#fff', border:'1px solid #E0E0E0', padding:'8px 12px', borderRadius:8, fontSize:13, display:'flex', gap:6, boxShadow:'0 1px 2px rgba(0,0,0,0.02)' }}>
          <span style={{ color:'#607D8B' }}>Insurance class</span> <strong style={{ color:'#1C2B3A' }}>{data.insurance || 'Standard'}</strong>
        </div>
      </div>
      <div style={{ background:'#fff', border:'1px solid #E0E0E0', padding:24, borderRadius:16, boxShadow:'0 4px 12px rgba(0,0,0,0.03)' }}>
        <div style={{ fontSize:14, color:'#607D8B', marginBottom:6 }}>5-year estimated total</div>
        <div style={{ fontSize:32, fontWeight:600, color:'#1C2B3A', marginBottom:12, letterSpacing:'-0.5px' }}>${data.total?.toLocaleString() || '25,250'}</div>
        <div style={{ fontSize:13.5, color:'#607D8B', display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
          ${data.costPerMile}/mi · {data.comparisonText} <span style={{ color:'#0F6E56', fontWeight:500, background:'#EAF3DE', padding:'2px 8px', borderRadius:12, display:'inline-block' }}>✓ {data.verdict}</span>
        </div>
      </div>
    </div>
  );
}

function ComparisonCard({ data }) {
  if (!data) return null;
  return (
    <div className="animate-slide-up" style={{ fontFamily:'Inter, sans-serif', color:'#1C2B3A', marginBottom:16, marginTop:8 }}>
      <p style={{ margin:'0 0 16px 0', fontSize:14.5, color:'#1C2B3A', fontWeight:500, lineHeight:1.5 }}>{data.summary}</p>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, alignItems:'stretch' }}>
        {/* Winner */}
        <div style={{ display:'flex', flexDirection:'column', background:'#E1F5EE', border:'1px solid #0F6E56', borderTop:'4px solid #0F6E56', padding:16, borderRadius:12, boxShadow:'0 4px 12px rgba(15,110,86,0.1)' }}>
          <div style={{ fontSize:13, color:'#0F6E56', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:12, display:'flex', alignItems:'center', gap:6 }}>
            <i className="ti ti-trophy" /> Winner
          </div>
          <div style={{ fontSize:14, color:'#0F6E56', fontWeight:600, marginBottom:8 }}>{data.winner?.name}</div>
          <div style={{ fontSize:28, fontWeight:700, color:'#085041', marginBottom:6, letterSpacing:'-0.5px' }}>${data.winner?.total?.toLocaleString()}</div>
          <div style={{ fontSize:13.5, color:'#0F6E56', fontWeight:500, marginTop:'auto' }}>${data.winner?.costPerMile}/mi</div>
        </div>
        {/* Loser */}
        <div style={{ display:'flex', flexDirection:'column', background:'#fff', border:'1px solid #E0E0E0', borderTop:'4px solid #E0E0E0', padding:16, borderRadius:12, boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize:13, color:'#90A4AE', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:12 }}>Alternative</div>
          <div style={{ fontSize:14, color:'#607D8B', fontWeight:600, marginBottom:8 }}>{data.loser?.name}</div>
          <div style={{ fontSize:28, fontWeight:700, color:'#1C2B3A', marginBottom:6, letterSpacing:'-0.5px' }}>${data.loser?.total?.toLocaleString()}</div>
          <div style={{ fontSize:13.5, color:'#607D8B', fontWeight:500, marginTop:'auto' }}>${data.loser?.costPerMile}/mi</div>
        </div>
      </div>
    </div>
  );
}

function VINCard({ data }) {
  if (!data) return null;
  return (
    <div className="animate-slide-up" style={{ fontFamily:'Inter, sans-serif', color:'#1C2B3A', marginBottom:16, marginTop:8 }}>
      <div style={{ display:'flex', gap:12, marginBottom:16, alignItems: 'center' }}>
        <div style={{ width:40, height:40, background:'linear-gradient(135deg, #00C8A8 0%, #0F6E56 100%)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', flexShrink:0, boxShadow:'0 4px 12px rgba(15,110,86,0.2)' }}>
          <i className="ti ti-car" style={{ fontSize:20 }} />
        </div>
        <div>
          <div style={{ fontSize:16, fontWeight:600, color:'#1C2B3A', letterSpacing:'-0.3px' }}>{data.year} {data.make} {data.model}</div>
          <div style={{ fontSize:13, color:'#607D8B' }}>VIN: <span style={{ fontFamily:'ui-monospace, monospace', color:'#1C2B3A', fontWeight:500, background:'#F5F8FC', padding:'2px 6px', borderRadius:4, border:'1px solid #EBF1F8' }}>{data.vin}</span></div>
        </div>
      </div>
      
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:12 }}>
        {[
          { label: 'Trim', value: data.trim },
          { label: 'Body Style', value: data.bodyClass },
          { label: 'Engine', value: data.engine },
          { label: 'Transmission', value: data.transmission },
          { label: 'Fuel Type', value: data.fuelType },
          { label: 'Drive Type', value: data.driveType },
          { label: 'Plant Country', value: data.plantCountry },
          { label: 'Manufacturer', value: data.manufacturer }
        ].map(item => (
          <div key={item.label} style={{ background:'#fff', border:'1px solid #EBF1F8', padding:'14px', borderRadius:12, boxShadow:'0 2px 8px rgba(0,0,0,0.02)', transition:'transform 0.2s' }}>
            <div style={{ fontSize:11, color:'#90A4AE', marginBottom:4, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px' }}>{item.label}</div>
            <div style={{ fontSize:14, color:'#1C2B3A', fontWeight:600, lineHeight:1.3 }}>{item.value && item.value !== 'Unknown' && item.value !== 'Not Applicable' ? item.value : '—'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const MarkdownComponents = {
  pre({children}) {
    // ReactMarkdown wraps code blocks in <pre>. We remove the <pre> styling because we render custom React components instead of raw text.
    return <div className="markdown-pre-wrapper" style={{ marginBottom: 16 }}>{children}</div>;
  },
  code({node, inline, className, children, ...props}) {
    const match = /language-(\w+)/.exec(className || '');
    if (!inline && match && match[1] === 'json') {
      try {
        const parsed = JSON.parse(String(children).replace(/\n$/, ''));
        if (parsed.type === 'tco_breakdown') return <TCOCard data={parsed} />;
        if (parsed.type === 'comparison') return <ComparisonCard data={parsed} />;
        if (parsed.type === 'vin_lookup') return <VINCard data={parsed} />;
      } catch (e) {}
    }
    return <code className={className} style={{ background:'rgba(0,0,0,0.06)', padding:'2px 5px', borderRadius:4, fontFamily:'ui-monospace, monospace', fontSize:'0.9em' }} {...props}>{children}</code>;
  },
  p({children}) { return <p style={{ margin:'0 0 14px 0', lineHeight:1.65 }}>{children}</p>; },
  h1({children}) { return <h1 style={{ margin:'20px 0 10px 0', fontSize:18, fontWeight:700, color:'#1C2B3A', letterSpacing:'-0.3px' }}>{children}</h1>; },
  h2({children}) { return <h2 style={{ margin:'18px 0 10px 0', fontSize:16, fontWeight:600, color:'#1C2B3A' }}>{children}</h2>; },
  h3({children}) { return <h3 style={{ margin:'16px 0 8px 0', fontSize:14, fontWeight:600, color:'#0F6E56', textTransform:'uppercase', letterSpacing:'0.5px' }}>{children}</h3>; },
  ul({children}) { return <ul style={{ margin:'0 0 14px 0', paddingLeft:22, display:'flex', flexDirection:'column', gap:6 }}>{children}</ul>; },
  ol({children}) { return <ol style={{ margin:'0 0 14px 0', paddingLeft:22, display:'flex', flexDirection:'column', gap:6 }}>{children}</ol>; },
  li({children}) { return <li style={{ lineHeight:1.5 }}>{children}</li>; },
  table({children}) { return <div style={{ overflowX:'auto', marginBottom:14 }}><table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>{children}</table></div>; },
  th({children}) { return <th style={{ textAlign:'left', padding:'8px 12px', borderBottom:'2px solid #D0DCE8', color:'#607D8B', fontWeight:600 }}>{children}</th>; },
  td({children}) { return <td style={{ padding:'8px 12px', borderBottom:'1px solid #EBF1F8' }}>{children}</td>; },
  strong({children}) { return <strong style={{ fontWeight:600, color:'#1C2B3A' }}>{children}</strong>; }
};

export default function ChatPage() {
  const { id } = useParams();
  const location = useLocation();
  const [messages,    setMessages]    = useState([]);
  const [input,       setInput]       = useState('');
  const [loading,     setLoading]     = useState(false);
  const [streaming,   setStreaming]   = useState(false);
  const [convId,      setConvId]      = useState(id || null);
  const [streamText,  setStreamText]  = useState('');
  const [imageFile,   setImageFile]   = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef  = useRef(null);
  const recognitionRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (id) loadConversation(id);
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages, streamText]);

  async function loadConversation(cid) {
    try {
      const conv = await APIService.getConversation(cid);
      setMessages(conv.messages.map(m => ({ role: m.role, content: m.content })));
    } catch {}
  }

  async function sendMessage(e) {
    e.preventDefault();
    if ((!input.trim() && !imageFile) || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg, image: imageFile }]);
    setStreaming(true);
    setStreamText('');

    try {
      let full = '';
      let newConvId = convId;

      const payload = {
        message: userMsg,
        conversationId: convId,
        image: imageFile,
        vehicleContext: location.state?.vehicleContext || null
      };

      // Clear pending attachments after sending
      setImageFile(null);

      for await (const chunk of APIService.streamMessage(payload)) {
        if (chunk.type === 'conversation_id') {
          newConvId = chunk.id;
          setConvId(chunk.id);
        }
        if (chunk.type === 'token') {
          full += chunk.text;
          setStreamText(full);
        }
        if (chunk.type === 'done') {
          setMessages(prev => [...prev, { role: 'assistant', content: full }]);
          setStreamText('');
        }
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }]);
      setStreamText('');
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#fff' }}>

      {/* Topbar */}
      <div style={{ height:56, padding:'0 24px', borderBottom:'1px solid #EBF1F8', display:'flex', alignItems:'center', justifyContent:'space-between', background:'#fff', flexShrink:0, zIndex:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:14, fontWeight:600, color:'#1C2B3A' }}>
          <div style={{ width:32, height:32, background:'#E1F5EE', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', color:'#0F6E56' }}>
            <i className="ti ti-message-2" style={{ fontSize:16 }} aria-hidden="true" />
          </div>
          {convId ? 'Active Diagnostic Session' : 'New Intelligence Session'}
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => window.print()} style={{ height:32, padding:'0 12px', background:'#F5F8FC', border:'1px solid #D0DCE8', borderRadius:8, fontSize:12, fontWeight:500, color:'#607D8B', display:'flex', alignItems:'center', gap:6, cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.borderColor = '#00C8A8'} onMouseOut={e => e.currentTarget.style.borderColor = '#D0DCE8'}>
            <i className="ti ti-download" style={{ fontSize:14 }} /> Export Report
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex:1, padding:'24px 32px', overflowY:'auto', display:'flex', flexDirection:'column', gap:24 }}>

        {messages.length === 0 && !streaming && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, color:'#90A4AE', textAlign:'center', animation:'fadeIn 0.5s ease-out' }}>
            <div style={{ width:64, height:64, background:'linear-gradient(135deg, #00C8A8 0%, #0F6E56 100%)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, fontWeight:600, color:'#fff', boxShadow:'0 8px 24px rgba(15,110,86,0.2)' }}>L</div>
            <div style={{ fontSize:18, fontWeight:600, color:'#1C2B3A', letterSpacing:'-0.3px' }}>Ask AAIA anything automotive</div>
            <div style={{ fontSize:13, color:'#607D8B', maxWidth:400 }}>Ask general questions about fleet management, compliance, or diagnostics, or upload an image to analyze.</div>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap', justifyContent:'center', marginTop:12, maxWidth:700 }}>
              {['What is the TCO for a 2022 Toyota Camry over 5 years?', 'Compare Ford F-150 vs Chevy Silverado for fleet use', 'What maintenance is due at 90,000 miles on a Honda CR-V?'].map(q => (
                <button key={q} onClick={() => setInput(q)} style={{ padding:'10px 16px', fontSize:13, fontWeight:500, background:'#fff', border:'1px solid #D0DCE8', borderRadius:24, color:'#1C2B3A', cursor:'pointer', transition:'all 0.2s', boxShadow:'0 2px 4px rgba(0,0,0,0.02)' }}
                  onMouseOver={e => e.target.style.borderColor = '#00C8A8'} onMouseOut={e => e.target.style.borderColor = '#D0DCE8'}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{ display:'flex', gap:14, alignItems:'flex-start', flexDirection: m.role === 'user' ? 'row-reverse' : 'row', animation:'fadeIn 0.3s ease-out' }}>
            {m.role === 'assistant' && (
              <div style={{ width:32, height:32, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:600, background:'#E1F5EE', color:'#0F6E56', marginTop:4 }}>L</div>
            )}
            <div className="chat-message-bubble" style={{ 
              padding: m.role === 'user' ? '12px 18px' : '20px 28px', 
              borderRadius: m.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px', 
              background: m.role === 'user' ? 'linear-gradient(135deg, var(--dblu), var(--mid))' : 'rgba(255, 255, 255, 0.85)', 
              backdropFilter: m.role === 'user' ? 'none' : 'blur(16px)',
              color: m.role === 'user' ? '#fff' : 'var(--dgray)', 
              maxWidth: m.role === 'user' ? 400 : 750, 
              fontSize:13.5, 
              boxShadow: m.role === 'user' ? '0 8px 24px rgba(10, 32, 133, 0.25)' : 'var(--shadow-md)',
              border: m.role === 'assistant' ? '1px solid rgba(255, 255, 255, 0.6)' : 'none'
            }}>
              {m.role === 'assistant'
                ? <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>{m.content}</ReactMarkdown>
                : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {m.image && <img src={m.image} alt="Uploaded attachment" style={{ maxWidth: 200, borderRadius: 8 }} />}
                    {m.voice && <audio src={m.voice} controls style={{ height: 32, maxWidth: 250 }} />}
                    {m.content && <span style={{ lineHeight:1.5 }}>{m.content}</span>}
                  </div>}
            </div>
          </div>
        ))}

        {streaming && streamText && (
          <div style={{ display:'flex', gap:14, alignItems:'flex-start', animation:'fadeIn 0.2s ease-out' }}>
            <div style={{ width:32, height:32, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:600, background:'#E1F5EE', color:'#0F6E56', marginTop:4 }}>L</div>
            <div className="chat-message-bubble" style={{ padding:'20px 28px', borderRadius:'20px 20px 20px 4px', background:'rgba(255, 255, 255, 0.85)', backdropFilter:'blur(16px)', color:'var(--dgray)', maxWidth:750, fontSize:13.5, border:'1px solid rgba(255, 255, 255, 0.6)', boxShadow:'var(--shadow-md)' }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>{streamText}</ReactMarkdown>
            </div>
          </div>
        )}

        {streaming && !streamText && (
          <div style={{ display:'flex', gap:9, alignItems:'center' }}>
            <div style={{ width:26, height:26, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:500, background:'#E1F5EE', color:'#0F6E56' }}>L</div>
            <div style={{ display:'flex', alignItems:'center', gap:7, color:'#90A4AE', fontSize:12 }}>
              <span className="loading-dot" />
              Thinking…
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div style={{ padding:'12px 18px', borderTop:'0.5px solid #D0DCE8', background:'#fff', flexShrink:0 }}>
        {imageFile && (
          <div style={{ display:'flex', gap:10, marginBottom:8 }}>
            <div style={{ position:'relative', display:'inline-block' }}>
              <img src={imageFile} alt="Upload preview" style={{ height:40, borderRadius:4, border:'1px solid #D0DCE8' }} />
              <button onClick={() => setImageFile(null)} style={{ position:'absolute', top:-6, right:-6, background:'red', color:'#fff', border:'none', borderRadius:'50%', width:16, height:16, fontSize:10, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
            </div>
          </div>
        )}

        <form onSubmit={sendMessage} style={{ display:'flex', gap:7, alignItems:'center' }}>
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                  const img = new Image();
                  img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const max_size = 1024;
                    if (width > max_size || height > max_size) {
                      if (width > height) {
                        height = Math.round((height * max_size) / width);
                        width = max_size;
                      } else {
                        width = Math.round((width * max_size) / height);
                        height = max_size;
                      }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    setImageFile(canvas.toDataURL('image/jpeg', 0.8));
                  };
                  img.src = reader.result;
                };
                reader.readAsDataURL(file);
              }
            }} 
          />
          <button type="button" onClick={() => fileInputRef.current?.click()} style={{ width:36, height:36, padding:0, background:'#F5F8FC', border:'1px solid #D0DCE8', color:'#607D8B', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'50%', cursor:'pointer' }}>
            <i className="ti ti-camera" style={{ fontSize:16 }} aria-hidden="true" />
          </button>

          <button type="button" 
            onClick={() => {
              if (isRecording) {
                recognitionRef.current?.stop();
                setIsRecording(false);
              } else {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                if (!SpeechRecognition) {
                  alert("Your browser does not support Speech Recognition.");
                  return;
                }
                if (!recognitionRef.current) {
                  recognitionRef.current = new SpeechRecognition();
                  recognitionRef.current.continuous = true;
                  recognitionRef.current.interimResults = true;
                  
                  recognitionRef.current.onstart = () => setIsRecording(true);
                  recognitionRef.current.onerror = (e) => { console.error(e); setIsRecording(false); };
                  recognitionRef.current.onend = () => setIsRecording(false);
                }
                
                recognitionRef.current.startText = input; // Capture existing input
                
                recognitionRef.current.onresult = (e) => {
                  let transcript = '';
                  for (let i = 0; i < e.results.length; i++) {
                    transcript += e.results[i][0].transcript;
                  }
                  setInput(recognitionRef.current.startText + (recognitionRef.current.startText ? ' ' : '') + transcript);
                };
                
                recognitionRef.current.start();
              }
            }} 
            style={{ width:36, height:36, padding:0, background: isRecording ? '#FFE5E5' : '#F5F8FC', border:'1px solid', borderColor: isRecording ? '#FF4D4D' : '#D0DCE8', color: isRecording ? '#FF4D4D' : '#607D8B', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'50%', cursor:'pointer' }}>
            <i className="ti ti-microphone" style={{ fontSize:16 }} aria-hidden="true" />
          </button>

          <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask AAIA about any vehicle…" style={{ flex:1, height:36, fontSize:13, borderRadius:4, border:'1px solid #D0DCE8', padding:'0 10px' }} disabled={loading} />
          <button type="submit" disabled={(!input.trim() && !imageFile) || loading}
            style={{ width:36, height:36, padding:0, background:'#0D2FA3', border:'none', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'50%', cursor:'pointer', opacity: (!input.trim() && !imageFile) ? .5 : 1 }}>
            <i className="ti ti-arrow-up" style={{ fontSize:15 }} aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
}
