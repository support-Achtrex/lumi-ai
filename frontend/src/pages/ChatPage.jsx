// src/pages/ChatPage.jsx
import { useState, useRef, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import APIService from '../services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Bot,
  User,
  Sparkles,
  Send,
  Camera,
  Mic,
  MicOff,
  Copy,
  Check,
  Volume2,
  VolumeX,
  RotateCcw,
  Download,
  Car,
  Trophy,
  DollarSign,
  Fuel,
  ShieldCheck,
  TrendingDown,
  Wrench,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
  ChevronRight,
  GitCompare,
  Search
} from 'lucide-react';

function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ margin: '14px 0', borderRadius: 8, overflow: 'hidden', border: '1px solid #E2E8F0', background: '#0F172A', color: '#F8FAFC' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 12px', background: '#1E293B', borderBottom: '1px solid #334155', fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        <span>{language || 'code'}</span>
        <button
          onClick={handleCopy}
          style={{ background: 'transparent', border: 'none', color: copied ? '#10B981' : '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '2px 6px', borderRadius: 4, minHeight: 'unset' }}
          title="Copy code"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre style={{ margin: 0, padding: 14, overflowX: 'auto', fontSize: 12.5, lineHeight: 1.5, fontFamily: 'ui-monospace, monospace' }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

function TCOCard({ data }) {
  if (!data) return null;
  return (
    <div className="animate-slide-up" style={{ fontFamily:'Inter, sans-serif', color:'#1C2B3A', marginBottom:16, marginTop:8, background:'#fff', border:'1px solid #EBF1F8', borderRadius:16, padding:20, boxShadow:'0 4px 16px rgba(0,0,0,0.03)' }}>
      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
        <span style={{ background:'#E1F5EE', color:'#0F6E56', padding:'4px 10px', borderRadius:8, fontSize:12, fontWeight:600, display:'flex', alignItems:'center', gap:6 }}>
          <Car size={14} /> {data.vin || 'VIN N/A'}
        </span>
        <span style={{ background:'#EEF2FF', color:'#3730A3', padding:'4px 10px', borderRadius:8, fontSize:12, fontWeight:600, display:'flex', alignItems:'center', gap:6 }}>
          <Layers size={14} /> {data.vehicle || 'Vehicle'}
        </span>
      </div>
      <p style={{ margin:'0 0 16px 0', fontSize:14, color:'#1C2B3A', fontWeight:500 }}>5-Year Total Cost of Ownership (TCO) Breakdown:</p>
      
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(130px, 1fr))', gap:10, marginBottom:16 }}>
        <div style={{ background:'#F8FAFC', border:'1px solid #E2E8F0', padding:'10px 14px', borderRadius:10 }}>
          <div style={{ fontSize:11, color:'#64748B', fontWeight:600, textTransform:'uppercase' }}>Depreciation</div>
          <div style={{ fontSize:16, fontWeight:700, color:'#1E293B', marginTop:2 }}>${data.depreciation?.toLocaleString() || data.depreciation || 0}</div>
        </div>
        <div style={{ background:'#F8FAFC', border:'1px solid #E2E8F0', padding:'10px 14px', borderRadius:10 }}>
          <div style={{ fontSize:11, color:'#64748B', fontWeight:600, textTransform:'uppercase' }}>Fuel</div>
          <div style={{ fontSize:16, fontWeight:700, color:'#1E293B', marginTop:2 }}>${data.fuel?.toLocaleString() || data.fuel || 0}</div>
        </div>
        <div style={{ background:'#F8FAFC', border:'1px solid #E2E8F0', padding:'10px 14px', borderRadius:10 }}>
          <div style={{ fontSize:11, color:'#64748B', fontWeight:600, textTransform:'uppercase' }}>Maintenance</div>
          <div style={{ fontSize:16, fontWeight:700, color:'#1E293B', marginTop:2 }}>${data.maintenance?.toLocaleString() || data.maintenance || 0}</div>
        </div>
        <div style={{ background:'#F8FAFC', border:'1px solid #E2E8F0', padding:'10px 14px', borderRadius:10 }}>
          <div style={{ fontSize:11, color:'#64748B', fontWeight:600, textTransform:'uppercase' }}>Insurance</div>
          <div style={{ fontSize:15, fontWeight:600, color:'#1E293B', marginTop:2 }}>{data.insurance || 'Standard'}</div>
        </div>
      </div>

      <div style={{ background:'linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)', border:'1px solid #A7F3D0', padding:20, borderRadius:12 }}>
        <div style={{ fontSize:12, color:'#047857', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:4 }}>5-Year Estimated Total</div>
        <div style={{ fontSize:30, fontWeight:700, color:'#065F46', marginBottom:8, letterSpacing:'-0.5px' }}>${data.total?.toLocaleString() || '25,250'}</div>
        <div style={{ fontSize:13, color:'#047857', display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
          <span><strong>${data.costPerMile || 0.34}</strong>/mi</span>
          <span>·</span>
          <span>{data.comparisonText || 'Competitive in class'}</span>
          <span style={{ color:'#047857', fontWeight:600, background:'#D1FAE5', padding:'2px 8px', borderRadius:10, display:'inline-flex', alignItems:'center', gap:4 }}>
            <CheckCircle2 size={12} /> {data.verdict || 'Recommended'}
          </span>
        </div>
      </div>
    </div>
  );
}

function ComparisonCard({ data }) {
  if (!data) return null;
  return (
    <div className="animate-slide-up" style={{ fontFamily:'Inter, sans-serif', color:'#1C2B3A', marginBottom:16, marginTop:8, background:'#fff', border:'1px solid #EBF1F8', borderRadius:16, padding:20, boxShadow:'0 4px 16px rgba(0,0,0,0.03)' }}>
      <p style={{ margin:'0 0 16px 0', fontSize:14, color:'#1C2B3A', fontWeight:500, lineHeight:1.5 }}>{data.summary}</p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:14, alignItems:'stretch' }}>
        {/* Winner */}
        <div style={{ display:'flex', flexDirection:'column', background:'#ECFDF5', border:'1.5px solid #10B981', padding:18, borderRadius:12, boxShadow:'0 4px 12px rgba(16,185,129,0.08)' }}>
          <div style={{ fontSize:12, color:'#059669', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:10, display:'flex', alignItems:'center', gap:6 }}>
            <Trophy size={16} /> Best Choice (Winner)
          </div>
          <div style={{ fontSize:16, color:'#065F46', fontWeight:700, marginBottom:8 }}>{data.winner?.name}</div>
          <div style={{ fontSize:28, fontWeight:800, color:'#064E3B', marginBottom:4, letterSpacing:'-0.5px' }}>${data.winner?.total?.toLocaleString()}</div>
          <div style={{ fontSize:13, color:'#059669', fontWeight:600, marginTop:'auto' }}>${data.winner?.costPerMile}/mile</div>
        </div>
        {/* Alternative */}
        <div style={{ display:'flex', flexDirection:'column', background:'#F8FAFC', border:'1px solid #E2E8F0', padding:18, borderRadius:12 }}>
          <div style={{ fontSize:12, color:'#64748B', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:10 }}>Alternative</div>
          <div style={{ fontSize:16, color:'#334155', fontWeight:700, marginBottom:8 }}>{data.loser?.name}</div>
          <div style={{ fontSize:28, fontWeight:700, color:'#1E293B', marginBottom:4, letterSpacing:'-0.5px' }}>${data.loser?.total?.toLocaleString()}</div>
          <div style={{ fontSize:13, color:'#64748B', fontWeight:500, marginTop:'auto' }}>${data.loser?.costPerMile}/mile</div>
        </div>
      </div>
    </div>
  );
}

function VINCard({ data }) {
  if (!data) return null;
  return (
    <div className="animate-slide-up" style={{ fontFamily:'Inter, sans-serif', color:'#1C2B3A', marginBottom:16, marginTop:8, background:'#fff', border:'1px solid #EBF1F8', borderRadius:16, padding:20, boxShadow:'0 4px 16px rgba(0,0,0,0.03)' }}>
      <div style={{ display:'flex', gap:12, marginBottom:16, alignItems: 'center' }}>
        <div style={{ width:44, height:44, background:'linear-gradient(135deg, #00E5C1 0%, #0A2085 100%)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', flexShrink:0, boxShadow:'0 4px 12px rgba(10,32,133,0.2)' }}>
          <Car size={22} />
        </div>
        <div>
          <div style={{ fontSize:16, fontWeight:700, color:'#1C2B3A', letterSpacing:'-0.3px' }}>{data.year} {data.make} {data.model}</div>
          <div style={{ fontSize:12.5, color:'#607D8B' }}>VIN: <span style={{ fontFamily:'ui-monospace, monospace', color:'#1C2B3A', fontWeight:600, background:'#F1F5F9', padding:'2px 6px', borderRadius:4 }}>{data.vin}</span></div>
        </div>
      </div>
      
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:10 }}>
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
          <div key={item.label} style={{ background:'#F8FAFC', border:'1px solid #E2E8F0', padding:'10px 12px', borderRadius:8 }}>
            <div style={{ fontSize:10.5, color:'#94A3B8', marginBottom:2, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px' }}>{item.label}</div>
            <div style={{ fontSize:13, color:'#1E293B', fontWeight:600 }}>{item.value && item.value !== 'Unknown' && item.value !== 'Not Applicable' ? item.value : '—'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const MarkdownComponents = {
  pre({children}) {
    return <div className="markdown-pre-wrapper">{children}</div>;
  },
  code({node, inline, className, children, ...props}) {
    const match = /language-(\w+)/.exec(className || '');
    const codeString = String(children).replace(/\n$/, '');
    
    if (!inline && match && match[1] === 'json') {
      try {
        const parsed = JSON.parse(codeString);
        if (parsed.type === 'tco_breakdown') return <TCOCard data={parsed} />;
        if (parsed.type === 'comparison') return <ComparisonCard data={parsed} />;
        if (parsed.type === 'vin_lookup') return <VINCard data={parsed} />;
      } catch (e) {}
    }
    
    if (!inline) {
      return <CodeBlock language={match ? match[1] : 'code'} code={codeString} />;
    }
    
    return <code className={className} style={{ background:'rgba(0,0,0,0.06)', padding:'2px 6px', borderRadius:4, fontFamily:'ui-monospace, monospace', fontSize:'0.9em', color:'#0F172A', fontWeight:500 }} {...props}>{children}</code>;
  },
  p({children}) { return <p style={{ margin:'0 0 14px 0', lineHeight:1.65 }}>{children}</p>; },
  h1({children}) { return <h1 style={{ margin:'22px 0 12px 0', fontSize:18, fontWeight:700, color:'#0F172A', letterSpacing:'-0.3px', borderBottom:'1px solid #E2E8F0', paddingBottom:6 }}>{children}</h1>; },
  h2({children}) { return <h2 style={{ margin:'18px 0 10px 0', fontSize:16, fontWeight:700, color:'#0F172A' }}>{children}</h2>; },
  h3({children}) { return <h3 style={{ margin:'16px 0 8px 0', fontSize:14, fontWeight:700, color:'#0A2085', textTransform:'uppercase', letterSpacing:'0.5px' }}>{children}</h3>; },
  ul({children}) { return <ul style={{ margin:'0 0 14px 0', paddingLeft:20, display:'flex', flexDirection:'column', gap:6 }}>{children}</ul>; },
  ol({children}) { return <ol style={{ margin:'0 0 14px 0', paddingLeft:20, display:'flex', flexDirection:'column', gap:6 }}>{children}</ol>; },
  li({children}) { return <li style={{ lineHeight:1.55 }}>{children}</li>; },
  table({children}) { return <div style={{ overflowX:'auto', margin:'16px 0', borderRadius:8, border:'1px solid #E2E8F0' }}><table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>{children}</table></div>; },
  th({children}) { return <th style={{ textAlign:'left', padding:'10px 14px', background:'#F8FAFC', borderBottom:'1px solid #CBD5E1', color:'#475569', fontWeight:600 }}>{children}</th>; },
  td({children}) { return <td style={{ padding:'10px 14px', borderBottom:'1px solid #F1F5F9', color:'#334155' }}>{children}</td>; },
  strong({children}) { return <strong style={{ fontWeight:600, color:'#0F172A' }}>{children}</strong>; }
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
  const [speakingIdx, setSpeakingIdx] = useState(null);
  const [copiedIdx,   setCopiedIdx]   = useState(null);
  
  const fileInputRef   = useRef(null);
  const recognitionRef = useRef(null);
  const bottomRef      = useRef(null);

  useEffect(() => {
    if (id) loadConversation(id);
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamText]);

  async function loadConversation(cid) {
    try {
      const conv = await APIService.getConversation(cid);
      setMessages(conv.messages.map(m => ({ role: m.role, content: m.content })));
    } catch (err) {
      console.error('Failed to load conversation', err);
    }
  }

  const handleCopyMessage = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleSpeak = (text, idx) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }
    if (speakingIdx === idx) {
      window.speechSynthesis.cancel();
      setSpeakingIdx(null);
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/```[\s\S]*?```/g, '').replace(/[#*_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onend = () => setSpeakingIdx(null);
    utterance.onerror = () => setSpeakingIdx(null);
    setSpeakingIdx(idx);
    window.speechSynthesis.speak(utterance);
  };

  const handleRetry = (lastUserMsg) => {
    if (!lastUserMsg || streaming) return;
    setInput(lastUserMsg);
  };

  async function sendMessage(e) {
    e?.preventDefault();
    if ((!input.trim() && !imageFile) || loading) return;

    const userMsg = input.trim();
    const sentImage = imageFile;
    setInput('');
    setImageFile(null);
    
    setMessages(prev => [...prev, { role: 'user', content: userMsg, image: sentImage }]);
    setStreaming(true);
    setStreamText('');

    try {
      let full = '';
      const payload = {
        message: userMsg,
        conversationId: convId,
        image: sentImage,
        vehicleContext: location.state?.vehicleContext || null
      };

      for await (const chunk of APIService.streamMessage(payload)) {
        if (chunk.type === 'conversation_id') {
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
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ An error occurred while generating reasoning. Please check your connectivity and try again.', error: true, retryMsg: userMsg }]);
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
          <div style={{ width:32, height:32, background:'linear-gradient(135deg, #00E5C1, #0A2085)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', boxShadow:'0 2px 8px rgba(10,32,133,0.15)' }}>
            <Sparkles size={16} />
          </div>
          <span>{convId ? 'Active Intelligence Session' : 'New Automotive Session'}</span>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => window.print()} style={{ height:32, padding:'0 12px', background:'#F5F8FC', border:'1px solid #D0DCE8', borderRadius:8, fontSize:12, fontWeight:500, color:'#607D8B', display:'flex', alignItems:'center', gap:6, cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.borderColor = '#00C8A8'} onMouseOut={e => e.currentTarget.style.borderColor = '#D0DCE8'}>
            <Download size={14} /> Export Session
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex:1, padding:'24px 32px', overflowY:'auto', display:'flex', flexDirection:'column', gap:24 }}>

        {messages.length === 0 && !streaming && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, color:'#90A4AE', textAlign:'center', animation:'fadeIn 0.5s ease-out' }}>
            <div style={{ width:68, height:68, background:'linear-gradient(135deg, #00E5C1 0%, #0A2085 100%)', borderRadius:20, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', boxShadow:'0 12px 32px rgba(10,32,133,0.2)' }}>
              <Bot size={36} />
            </div>
            <div style={{ fontSize:20, fontWeight:700, color:'#1C2B3A', letterSpacing:'-0.3px' }}>Ask AAIA Automotive Intelligence</div>
            <div style={{ fontSize:13.5, color:'#607D8B', maxWidth:480, lineHeight: 1.5 }}>
              Expert AI reasoning for total cost of ownership, fleet predictive maintenance, OBD-II diagnostic strategies, and vehicle specs.
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:12, marginTop:16, maxWidth:720, width:'100%' }}>
              {[
                { title: 'Calculate 5-Year TCO', desc: 'What is the TCO for a 2022 Toyota Camry over 5 years?', icon: DollarSign },
                { title: 'Fleet Comparison', desc: 'Compare Ford F-150 vs Chevy Silverado for commercial fleet', icon: GitCompare },
                { title: 'Diagnostic Strategy', desc: 'Diagnose OBD DTC P0300 random misfire on Ford EcoBoost', icon: Wrench },
                { title: 'Maintenance Schedule', desc: 'What maintenance is due at 90,000 miles on a Honda CR-V?', icon: Search }
              ].map((item, qIdx) => {
                const ItemIcon = item.icon;
                return (
                  <button
                    key={qIdx}
                    onClick={() => setInput(item.desc)}
                    style={{ padding:'14px 16px', background:'#fff', border:'1px solid #E2E8F0', borderRadius:12, color:'#1C2B3A', cursor:'pointer', transition:'all 0.2s', boxShadow:'0 2px 6px rgba(0,0,0,0.02)', textAlign:'left', display:'flex', flexDirection:'column', gap:4 }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = '#0A2085'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, fontWeight:600, color:'#0A2085' }}>
                      <ItemIcon size={15} /> {item.title}
                    </div>
                    <div style={{ fontSize:12, color:'#64748B', lineHeight:1.4 }}>{item.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{ display:'flex', gap:14, alignItems:'flex-start', flexDirection: m.role === 'user' ? 'row-reverse' : 'row', animation:'fadeIn 0.3s ease-out' }}>
            {m.role === 'assistant' ? (
              <div style={{ width:34, height:34, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg, #00E5C1, #0A2085)', color:'#fff', marginTop:4, boxShadow:'0 2px 8px rgba(10,32,133,0.2)' }}>
                <Bot size={18} />
              </div>
            ) : (
              <div style={{ width:34, height:34, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background:'#E2E8F0', color:'#475569', marginTop:4 }}>
                <User size={18} />
              </div>
            )}
            
            <div style={{ display:'flex', flexDirection:'column', maxWidth: m.role === 'user' ? 420 : 780 }}>
              <div className="chat-message-bubble" style={{ 
                padding: m.role === 'user' ? '12px 18px' : '20px 26px', 
                borderRadius: m.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px', 
                background: m.role === 'user' ? 'linear-gradient(135deg, #0A2085, #1E40AF)' : '#FFFFFF', 
                color: m.role === 'user' ? '#fff' : '#1E293B', 
                fontSize:13.5, 
                boxShadow: m.role === 'user' ? '0 8px 24px rgba(10, 32, 133, 0.25)' : '0 4px 16px rgba(0,0,0,0.04)',
                border: m.role === 'assistant' ? '1px solid #E2E8F0' : 'none'
              }}>
                {m.role === 'assistant' ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>{m.content}</ReactMarkdown>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {m.image && <img src={m.image} alt="Uploaded attachment" style={{ maxWidth: 220, borderRadius: 8, border: '1px solid rgba(255,255,255,0.3)' }} />}
                    {m.voice && <audio src={m.voice} controls style={{ height: 32, maxWidth: 250 }} />}
                    {m.content && <span style={{ lineHeight:1.55 }}>{m.content}</span>}
                  </div>
                )}
              </div>

              {/* Assistant Message Actions Toolbar */}
              {m.role === 'assistant' && !m.error && (
                <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:6, paddingLeft:6, color:'#94A3B8', fontSize:12 }}>
                  <button
                    onClick={() => handleCopyMessage(m.content, i)}
                    style={{ background:'transparent', border:'none', color:'#94A3B8', cursor:'pointer', display:'flex', alignItems:'center', gap:4, padding:2, fontSize:11, minHeight:'unset' }}
                    onMouseOver={e => e.currentTarget.style.color = '#0A2085'}
                    onMouseOut={e => e.currentTarget.style.color = '#94A3B8'}
                    title="Copy full response"
                  >
                    {copiedIdx === i ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                    <span>{copiedIdx === i ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={() => handleSpeak(m.content, i)}
                    style={{ background:'transparent', border:'none', color: speakingIdx === i ? '#0A2085' : '#94A3B8', cursor:'pointer', display:'flex', alignItems:'center', gap:4, padding:2, fontSize:11, minHeight:'unset' }}
                    onMouseOver={e => e.currentTarget.style.color = '#0A2085'}
                    onMouseOut={e => e.currentTarget.style.color = speakingIdx === i ? '#0A2085' : '#94A3B8'}
                    title={speakingIdx === i ? "Stop speaking" : "Listen to response"}
                  >
                    {speakingIdx === i ? <VolumeX size={13} /> : <Volume2 size={13} />}
                    <span>{speakingIdx === i ? 'Stop' : 'Read aloud'}</span>
                  </button>
                </div>
              )}

              {/* Retry on Error */}
              {m.error && m.retryMsg && (
                <button
                  onClick={() => handleRetry(m.retryMsg)}
                  style={{ alignSelf:'flex-start', marginTop:8, display:'flex', alignItems:'center', gap:6, padding:'6px 12px', background:'#FEE2E2', border:'1px solid #FCA5A5', color:'#991B1B', borderRadius:6, fontSize:12, cursor:'pointer' }}
                >
                  <RotateCcw size={12} /> Retry query
                </button>
              )}
            </div>
          </div>
        ))}

        {streaming && streamText && (
          <div style={{ display:'flex', gap:14, alignItems:'flex-start', animation:'fadeIn 0.2s ease-out' }}>
            <div style={{ width:34, height:34, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg, #00E5C1, #0A2085)', color:'#fff', marginTop:4 }}>
              <Bot size={18} />
            </div>
            <div className="chat-message-bubble" style={{ padding:'20px 26px', borderRadius:'20px 20px 20px 4px', background:'#FFFFFF', color:'#1E293B', maxWidth:780, fontSize:13.5, border:'1px solid #E2E8F0', boxShadow:'0 4px 16px rgba(0,0,0,0.04)' }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>{streamText}</ReactMarkdown>
            </div>
          </div>
        )}

        {streaming && !streamText && (
          <div style={{ display:'flex', gap:12, alignItems:'center', paddingLeft: 4 }}>
            <div style={{ width:28, height:28, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg, #00E5C1, #0A2085)', color:'#fff' }}>
              <Bot size={14} />
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:7, color:'#64748B', fontSize:12.5, fontWeight:500 }}>
              <span className="loading-dot" />
              Reasoning & analyzing automotive datasets…
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div style={{ padding:'14px 20px', borderTop:'1px solid #E2E8F0', background:'#fff', flexShrink:0 }}>
        {imageFile && (
          <div style={{ display:'flex', gap:10, marginBottom:10 }}>
            <div style={{ position:'relative', display:'inline-block' }}>
              <img src={imageFile} alt="Upload preview" style={{ height:48, borderRadius:6, border:'1px solid #CBD5E1' }} />
              <button onClick={() => setImageFile(null)} style={{ position:'absolute', top:-6, right:-6, background:'#EF4444', color:'#fff', border:'none', borderRadius:'50%', width:18, height:18, fontSize:10, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', minHeight:'unset' }}>
                <X size={12} />
              </button>
            </div>
          </div>
        )}

        <form onSubmit={sendMessage} style={{ display:'flex', gap:8, alignItems:'center' }}>
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
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{ width:38, height:38, padding:0, background:'#F8FAFC', border:'1px solid #CBD5E1', color:'#64748B', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'50%', cursor:'pointer', minHeight:'unset' }}
            title="Upload photo for vision analysis"
            onMouseOver={e => e.currentTarget.style.borderColor = '#0A2085'}
            onMouseOut={e => e.currentTarget.style.borderColor = '#CBD5E1'}
          >
            <Camera size={17} />
          </button>

          <button
            type="button" 
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
                
                recognitionRef.current.startText = input;
                
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
            style={{ width:38, height:38, padding:0, background: isRecording ? '#FEE2E2' : '#F8FAFC', border:'1px solid', borderColor: isRecording ? '#EF4444' : '#CBD5E1', color: isRecording ? '#EF4444' : '#64748B', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'50%', cursor:'pointer', minHeight:'unset' }}
            title={isRecording ? "Stop voice recording" : "Record voice query"}
          >
            {isRecording ? <MicOff size={17} /> : <Mic size={17} />}
          </button>

          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask AAIA about any vehicle, TCO, maintenance, or DTC..."
            style={{ flex:1, height:40, fontSize:13.5, borderRadius:20, border:'1px solid #CBD5E1', padding:'0 16px', background:'#F8FAFC' }}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={(!input.trim() && !imageFile) || loading}
            style={{ width:40, height:40, padding:0, background:'linear-gradient(135deg, #0A2085, #1E40AF)', border:'none', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'50%', cursor:'pointer', opacity: (!input.trim() && !imageFile) ? 0.4 : 1, minHeight:'unset', boxShadow:'0 2px 8px rgba(10,32,133,0.2)' }}
            title="Send query"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
