// src/pages/DiagnosticsPage.jsx
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import APIService from '../services/api';

const SAMPLE_CODES = [
  { code:'P0420', desc:'Catalyst system efficiency below threshold (Bank 1)', cause:'Worn catalytic converter or O2 sensor', cost:'$380–$1,200', severity:'stored' },
  { code:'P0128', desc:'Coolant temperature below thermostat regulating temperature', cause:'Faulty thermostat', cost:'$150–$300', severity:'stored' },
];

export default function DiagnosticsPage() {
  const { state } = useLocation();
  const [vin,     setVin]     = useState(state?.vin || '');
  const [damage,  setDamage]  = useState('');
  const [location, setLocation] = useState('');
  const [result,  setResult]  = useState(null);
  const [maint,   setMaint]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab,     setTab]     = useState('obd');

  async function assessDamage() {
    if (!damage.trim()) return;
    setLoading(true);
    try { setResult(await APIService.assessDamage(damage, vin, location)); }
    catch {} finally { setLoading(false); }
  }

  async function getMaintenance() {
    if (!vin.trim()) return;
    setLoading(true);
    try { setMaint(await APIService.getMaintenanceSchedule(vin, 87000, 75000, '')); }
    catch {} finally { setLoading(false); }
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <div style={{ height:46, padding:'0 18px', borderBottom:'0.5px solid #D0DCE8', display:'flex', alignItems:'center', gap:8, background:'#fff', fontSize:13, fontWeight:500, color:'#1C2B3A', flexShrink:0 }}>
        <i className="ti ti-tool" style={{ fontSize:15, color:'#607D8B' }} aria-hidden="true" /> Diagnostics
      </div>
      <div style={{ flex:1, padding:18, overflowY:'auto' }}>
        <div style={{ display:'flex', gap:4, marginBottom:16, borderBottom:'0.5px solid #D0DCE8', paddingBottom:0 }}>
          {[['obd','OBD2 & fault codes'],['damage','Damage assessment'],['maintenance','Maintenance schedule']].map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)} style={{ height:34, padding:'0 14px', fontSize:12.5, borderRadius:'8px 8px 0 0', border:'0.5px solid', background: tab===k ? '#fff' : 'transparent', borderColor: tab===k ? '#D0DCE8' : 'transparent', borderBottomColor: tab===k ? '#fff' : 'transparent', color: tab===k ? '#1C2B3A' : '#607D8B', fontWeight: tab===k ? 500 : 400, marginBottom: tab===k ? -1 : 0, position:'relative' }}>{l}</button>
          ))}
        </div>

        {tab === 'obd' && (
          <>
            <div style={{ display:'flex', gap:8, marginBottom:14 }}>
              <input value={vin} onChange={e=>setVin(e.target.value)} placeholder="VIN" style={{ flex:1, height:36, fontSize:12 }} />
              <button className="btn-primary" style={{ height:36, padding:'0 14px', fontSize:12 }}>Connect OBD2</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
              {[['87°C','Engine temp'],['14.2V','Battery voltage'],['760 rpm','Engine RPM'],['0 mph','Vehicle speed']].map(([v,l]) => (
                <div key={l} className="card" style={{ padding:'12px 14px' }}>
                  <div style={{ fontSize:22, fontWeight:500, color:'#1C2B3A' }}>{v}</div>
                  <div style={{ fontSize:11, color:'#607D8B', marginTop:2 }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize:12, fontWeight:500, color:'#1C2B3A', marginBottom:8 }}>Active & stored fault codes</div>
            <div className="card">
              {SAMPLE_CODES.map(c => (
                <div key={c.code} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 14px', borderBottom:'0.5px solid #D0DCE8' }}>
                  <span style={{ fontFamily:'monospace', fontSize:12, fontWeight:500, color:'#A32D2D', background:'#FCEBEB', padding:'3px 8px', borderRadius:4, whiteSpace:'nowrap' }}>{c.code}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:500, color:'#1C2B3A' }}>{c.desc}</div>
                    <div style={{ fontSize:11, color:'#607D8B', marginTop:2 }}>Likely cause: {c.cause} · Est. repair {c.cost}</div>
                  </div>
                  <span style={{ background:'#FAEEDA', color:'#633806', borderRadius:4, padding:'2px 7px', fontSize:11, fontWeight:500, whiteSpace:'nowrap' }}>{c.severity}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'damage' && (
          <>
            <textarea value={damage} onChange={e=>setDamage(e.target.value)} placeholder="Describe the damage…" style={{ width:'100%', height:80, border:'0.5px solid #D0DCE8', borderRadius:8, padding:10, fontSize:13, resize:'none', marginBottom:8 }} />
            <div style={{ display:'flex', gap:8, marginBottom:14 }}>
              <input value={vin} onChange={e=>setVin(e.target.value)} placeholder="VIN (optional)" style={{ flex:1, height:36, fontSize:12 }} />
              <input value={location} onChange={e=>setLocation(e.target.value)} placeholder="City / region" style={{ flex:1, height:36, fontSize:12 }} />
              <button className="btn-primary" style={{ height:36, fontSize:12 }} onClick={assessDamage} disabled={loading}>{loading?'Assessing…':'Assess damage'}</button>
            </div>
            {result && (
              <div className="card">
                <div className="card-header">
                  <div style={{ fontSize:13, fontWeight:500 }}>LUMI AI assessment</div>
                  <span style={{ background:'#FAEEDA', color:'#633806', borderRadius:4, padding:'2px 8px', fontSize:11, fontWeight:500 }}>SEV-2 — moderate</span>
                </div>
                <div style={{ padding:'13px 15px', fontSize:12.5, lineHeight:1.6, whiteSpace:'pre-wrap' }}>{result.assessment}</div>
              </div>
            )}
          </>
        )}

        {tab === 'maintenance' && (
          <>
            <div style={{ display:'flex', gap:8, marginBottom:14 }}>
              <input value={vin} onChange={e=>setVin(e.target.value)} placeholder="VIN" style={{ flex:2, height:36, fontSize:12 }} />
              <button className="btn-primary" style={{ height:36, fontSize:12 }} onClick={getMaintenance} disabled={loading}>{loading?'Loading…':'Get schedule'}</button>
            </div>
            {maint && (
              <div className="card">
                <div className="card-header"><div style={{ fontSize:13, fontWeight:500 }}>Maintenance schedule</div></div>
                <div style={{ padding:'13px 15px', fontSize:12.5, lineHeight:1.6, whiteSpace:'pre-wrap' }}>{maint.assessment}</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
