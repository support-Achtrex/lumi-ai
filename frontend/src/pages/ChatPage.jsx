// src/pages/ChatPage.jsx
import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import APIService from '../services/api';
import ReactMarkdown from 'react-markdown';

function TCOCard({ data }) {
  if (!data) return null;
  return (
    <div style={{ fontFamily:'Inter, sans-serif', color:'#1C2B3A', marginBottom:16, marginTop:8 }}>
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
        <div style={{ fontSize:13.5, color:'#607D8B', display:'flex', alignItems:'center', gap:6 }}>
          ${data.costPerMile}/mi · {data.comparisonText} <span style={{ color:'#0F6E56', fontWeight:500, background:'#EAF3DE', padding:'2px 8px', borderRadius:12 }}>✓ {data.verdict}</span>
        </div>
      </div>
    </div>
  );
}

function ComparisonCard({ data }) {
  if (!data) return null;
  return (
    <div style={{ fontFamily:'Inter, sans-serif', color:'#1C2B3A', marginBottom:16, marginTop:8 }}>
      <p style={{ margin:'0 0 16px 0', fontSize:14.5, color:'#1C2B3A', fontWeight:500, lineHeight:1.5 }}>{data.summary}</p>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        {/* Winner */}
        <div style={{ background:'#E1F5EE', border:'1px solid #0F6E56', padding:20, borderRadius:16, position:'relative', overflow:'hidden', boxShadow:'0 4px 12px rgba(15,110,86,0.1)' }}>
          <div style={{ position:'absolute', top:0, left:0, width:'100%', height:4, background:'#0F6E56' }} />
          <div style={{ fontSize:14, color:'#0F6E56', fontWeight:600, marginBottom:10 }}>{data.winner?.name} · winner</div>
          <div style={{ fontSize:28, fontWeight:600, color:'#085041', marginBottom:6, letterSpacing:'-0.5px' }}>${data.winner?.total?.toLocaleString()}</div>
          <div style={{ fontSize:13.5, color:'#0F6E56', fontWeight:500 }}>${data.winner?.costPerMile}/mi</div>
        </div>
        {/* Loser */}
        <div style={{ background:'#fff', border:'1px solid #E0E0E0', padding:20, borderRadius:16, boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize:14, color:'#607D8B', marginBottom:10 }}>{data.loser?.name}</div>
          <div style={{ fontSize:28, fontWeight:600, color:'#1C2B3A', marginBottom:6, letterSpacing:'-0.5px' }}>${data.loser?.total?.toLocaleString()}</div>
          <div style={{ fontSize:13.5, color:'#607D8B' }}>${data.loser?.costPerMile}/mi</div>
        </div>
      </div>
    </div>
  );
}

const MarkdownComponents = {
  code({node, inline, className, children, ...props}) {
    const match = /language-(\w+)/.exec(className || '');
    if (!inline && match && match[1] === 'json') {
      try {
        const parsed = JSON.parse(String(children).replace(/\n$/, ''));
        if (parsed.type === 'tco_breakdown') return <TCOCard data={parsed} />;
        if (parsed.type === 'comparison') return <ComparisonCard data={parsed} />;
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
  const [messages,    setMessages]    = useState([]);
  const [input,       setInput]       = useState('');
  const [vin,         setVin]         = useState('');
  const [loading,     setLoading]     = useState(false);
  const [streaming,   setStreaming]   = useState(false);
  const [convId,      setConvId]      = useState(id || null);
  const [streamText,  setStreamText]  = useState('');
  const bottomRef = useRef(null);

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
    } catch {}
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setStreaming(true);
    setStreamText('');

    try {
      let full = '';
      let newConvId = convId;

      for await (const chunk of APIService.streamMessage(userMsg, convId, vin || undefined)) {
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
          <button style={{ height:32, padding:'0 12px', background:'#F5F8FC', border:'1px solid #D0DCE8', borderRadius:8, fontSize:12, fontWeight:500, color:'#607D8B', display:'flex', alignItems:'center', gap:6 }}>
            <i className="ti ti-download" style={{ fontSize:14 }} /> Export Report
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex:1, padding:'24px 32px', overflowY:'auto', display:'flex', flexDirection:'column', gap:24 }}>

        {messages.length === 0 && !streaming && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, color:'#90A4AE', textAlign:'center', animation:'fadeIn 0.5s ease-out' }}>
            <div style={{ width:64, height:64, background:'linear-gradient(135deg, #00C8A8 0%, #0F6E56 100%)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, fontWeight:600, color:'#fff', boxShadow:'0 8px 24px rgba(15,110,86,0.2)' }}>L</div>
            <div style={{ fontSize:18, fontWeight:600, color:'#1C2B3A', letterSpacing:'-0.3px' }}>Ask LUMI AI anything automotive</div>
            <div style={{ fontSize:13, color:'#607D8B', maxWidth:400 }}>Enter a VIN below to ground responses in real vehicle data, or ask general questions about fleet management, compliance, or diagnostics.</div>
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
            <div style={{ 
              padding: m.role === 'user' ? '12px 18px' : '18px 24px', 
              borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', 
              background: m.role === 'user' ? 'linear-gradient(135deg, #0D2FA3 0%, #1A44D1 100%)' : '#F4F2EC', 
              color: m.role === 'user' ? '#fff' : '#1C2B3A', 
              maxWidth: m.role === 'user' ? 400 : 700, 
              fontSize:13.5, 
              boxShadow: m.role === 'user' ? '0 4px 12px rgba(13,47,163,0.15)' : 'none',
              border: m.role === 'assistant' ? '1px solid rgba(0,0,0,0.03)' : 'none'
            }}>
              {m.role === 'assistant'
                ? <ReactMarkdown components={MarkdownComponents}>{m.content}</ReactMarkdown>
                : <span style={{ lineHeight:1.5 }}>{m.content}</span>}
            </div>
          </div>
        ))}

        {streaming && streamText && (
          <div style={{ display:'flex', gap:14, alignItems:'flex-start', animation:'fadeIn 0.2s ease-out' }}>
            <div style={{ width:32, height:32, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:600, background:'#E1F5EE', color:'#0F6E56', marginTop:4 }}>L</div>
            <div style={{ padding:'18px 24px', borderRadius:'16px 16px 16px 4px', background:'#F4F2EC', color:'#1C2B3A', maxWidth:700, fontSize:13.5, border:'1px solid rgba(0,0,0,0.03)' }}>
              <ReactMarkdown components={MarkdownComponents}>{streamText}</ReactMarkdown>
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
        <div style={{ display:'flex', gap:7, marginBottom:7 }}>
          <input value={vin} onChange={e => setVin(e.target.value)} placeholder="VIN (optional) — grounds LUMI AI in real vehicle data" style={{ flex:1, height:31, fontSize:12, background:'#F5F8FC' }} />
          {vin && (
            <button style={{ height:31, padding:'0 11px', background:'#00C8A8', border:'none', color:'#04342C', fontWeight:500, fontSize:12 }}
              onClick={() => setInput(`Tell me everything about VIN ${vin}`)}>
              <i className="ti ti-search" style={{ fontSize:12 }} aria-hidden="true" /> Look up
            </button>
          )}
        </div>
        <form onSubmit={sendMessage} style={{ display:'flex', gap:7 }}>
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask LUMI AI about any vehicle…" style={{ flex:1, height:36, fontSize:13 }} disabled={loading} />
          <button type="submit" disabled={!input.trim() || loading}
            style={{ width:36, height:36, padding:0, background:'#0D2FA3', border:'none', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', opacity: !input.trim() ? .5 : 1 }}>
            <i className="ti ti-arrow-up" style={{ fontSize:15 }} aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
}
