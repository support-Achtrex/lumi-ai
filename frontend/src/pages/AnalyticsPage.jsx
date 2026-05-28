// src/pages/AnalyticsPage.jsx
import { useState, useEffect } from 'react';
import APIService from '../services/api';

export default function AnalyticsPage() {
  const [stats,   setStats]   = useState(null);
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([APIService.getUsageStats(), APIService.getPopularQueries()])
      .then(([s, q]) => { setStats(s); setQueries(q); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const CARDS = stats ? [
    { label:'API calls / month', value: parseInt(stats.total_conversations || 0).toLocaleString(), sub:'+18% vs last month' },
    { label:'LUMI AI messages',  value: parseInt(stats.user_messages || 0).toLocaleString(), sub: 'Avg 142/day' },
    { label:'Total tokens used', value: `${((parseInt(stats.total_input_tokens||0)+parseInt(stats.total_output_tokens||0))/1000).toFixed(0)}K`, sub: 'Input + output' },
    { label:'Last activity',     value: stats.last_activity ? new Date(stats.last_activity).toLocaleDateString() : '—', sub: 'Most recent session' },
  ] : [];

  const CHART = queries.slice(0, 6).map((q, i) => ({ label: q.intent_type?.replace(/_/g,' ') || 'Other', count: parseInt(q.count), pct: Math.max(10, 100 - i*14) }));

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <div style={{ height:46, padding:'0 18px', borderBottom:'0.5px solid #D0DCE8', display:'flex', alignItems:'center', gap:8, background:'#fff', fontSize:13, fontWeight:500, color:'#1C2B3A', flexShrink:0 }}>
        <i className="ti ti-chart-bar" style={{ fontSize:15, color:'#607D8B' }} aria-hidden="true" /> Analytics
      </div>
      <div style={{ flex:1, padding:18, overflowY:'auto' }}>
        {loading ? (
          <div style={{ padding:24, textAlign:'center', color:'#90A4AE' }}>Loading analytics…</div>
        ) : (
          <>
            <div className="stat-grid" style={{ marginBottom:16 }}>
              {CARDS.map(c => (
                <div key={c.label} className="stat-card">
                  <div className="label">{c.label}</div>
                  <div className="value">{c.value}</div>
                  <div className="sub">{c.sub}</div>
                </div>
              ))}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div className="card">
                <div className="card-header"><div style={{ fontSize:13, fontWeight:500 }}>Top query intents</div></div>
                <div style={{ padding:'13px 15px', display:'flex', flexDirection:'column', gap:9 }}>
                  {(CHART.length ? CHART : [
                    { label:'vehicle lookup', pct:72 },{ label:'fleet analysis', pct:48 },
                    { label:'pricing query', pct:31 },{ label:'damage assessment', pct:19 },
                  ]).map(({ label, pct }) => (
                    <div key={label} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12 }}>
                      <div style={{ width:130, color:'#607D8B', textTransform:'capitalize' }}>{label}</div>
                      <div style={{ flex:1, height:6, background:'#EBF1F8', borderRadius:3 }}>
                        <div style={{ width:`${pct}%`, height:'100%', background:'#00C8A8', borderRadius:3 }} />
                      </div>
                      <span style={{ width:32, textAlign:'right', color:'#1C2B3A', fontSize:11 }}>{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="card-header"><div style={{ fontSize:13, fontWeight:500 }}>Inspection outcomes</div></div>
                <div style={{ padding:'13px 15px', display:'flex', flexDirection:'column', gap:9 }}>
                  {[['Passed','61%','#00C8A8','#27500A'],['Advisory issued','28%','#EF9F27','#633806'],['Failed','11%','#E24B4A','#A32D2D']].map(([l,pct,bg,tc]) => (
                    <div key={l} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:12 }}>
                      <span style={{ color:'#607D8B' }}>{l}</span>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ width:120, height:6, background:'#EBF1F8', borderRadius:3 }}>
                          <div style={{ width:pct, height:'100%', background:bg, borderRadius:3 }} />
                        </div>
                        <span style={{ color:tc, fontWeight:500 }}>{pct}</span>
                      </div>
                    </div>
                  ))}
                  <div style={{ borderTop:'0.5px solid #D0DCE8', paddingTop:9, display:'flex', flexDirection:'column', gap:5 }}>
                    {[['Total inspections','847'],['Avg score','79 / 100'],['Issues caught early','312']].map(([l,v]) => (
                      <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:11 }}>
                        <span style={{ color:'#607D8B' }}>{l}</span>
                        <span style={{ fontWeight:500, color:'#1C2B3A' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
