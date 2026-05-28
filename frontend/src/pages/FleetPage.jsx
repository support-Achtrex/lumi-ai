// src/pages/FleetPage.jsx
import { useState, useEffect } from 'react';
import APIService from '../services/api';

export default function FleetPage() {
  const [fleets,   setFleets]   = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [analysis, setAnalysis] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [type,     setType]     = useState('maintenance');

  useEffect(() => { loadFleets(); }, []);

  async function loadFleets() {
    try {
      const data = await APIService.getFleets();
      setFleets(data);
      if (data.length > 0) loadFleet(data[0].id);
    } catch {}
  }

  async function loadFleet(id) {
    setSelected(id);
    try {
      const data = await APIService.getFleetVehicles(id);
      setVehicles(data);
    } catch {}
  }

  async function runAnalysis() {
    if (!selected) return;
    setAnalysis(''); setLoading(true);
    try {
      const res = await APIService.analyseFleet(selected, type);
      setAnalysis(res.analysis);
    } catch { setAnalysis('Analysis failed. Please try again.'); }
    finally { setLoading(false); }
  }

  const riskCounts = { High: vehicles.filter(v=>v.risk==='high').length, Medium: vehicles.filter(v=>v.risk==='medium').length, Low: vehicles.filter(v=>v.risk==='low').length };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <div style={{ height:46, padding:'0 18px', borderBottom:'0.5px solid #D0DCE8', display:'flex', alignItems:'center', justifyContent:'space-between', background:'#fff', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, fontWeight:500, color:'#1C2B3A' }}>
          <i className="ti ti-truck" style={{ fontSize:15, color:'#607D8B' }} aria-hidden="true" /> Fleet management
        </div>
        <div style={{ display:'flex', gap:7 }}>
          <select value={type} onChange={e=>setType(e.target.value)} style={{ height:32, fontSize:12, padding:'0 8px' }}>
            <option value="maintenance">Maintenance priority</option>
            <option value="tco">Total cost of ownership</option>
            <option value="performance">Performance</option>
            <option value="risk">Risk assessment</option>
          </select>
          <button className="btn-teal" style={{ height:32, padding:'0 12px', fontSize:12 }} onClick={runAnalysis} disabled={loading}>
            <i className="ti ti-robot" style={{ fontSize:12 }} aria-hidden="true" />
            {loading ? 'Analysing…' : 'Run LUMI analysis'}
          </button>
        </div>
      </div>
      <div style={{ flex:1, padding:18, overflowY:'auto' }}>
        <div className="stat-grid">
          <div className="stat-card"><div className="label">Vehicles</div><div className="value">{vehicles.length}</div></div>
          <div className="stat-card"><div className="label">High risk</div><div className="value" style={{color:'#A32D2D'}}>{riskCounts.High}</div></div>
          <div className="stat-card"><div className="label">Medium risk</div><div className="value" style={{color:'#633806'}}>{riskCounts.Medium}</div></div>
          <div className="stat-card"><div className="label">Low risk</div><div className="value" style={{color:'#27500A'}}>{riskCounts.Low}</div></div>
        </div>

        <div className="card" style={{ marginBottom:14 }}>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 80px', background:'#F5F8FC', borderBottom:'0.5px solid #D0DCE8' }}>
            {['Vehicle','Mileage','Last service','Risk','Est. cost',''].map(h => (
              <div key={h} style={{ padding:'8px 14px', fontSize:11, fontWeight:500, color:'#607D8B' }}>{h}</div>
            ))}
          </div>
          {vehicles.length === 0 ? (
            <div style={{ padding:'24px', textAlign:'center', color:'#90A4AE', fontSize:13 }}>No vehicles in fleet. Add vehicles to get started.</div>
          ) : vehicles.map(v => (
            <div key={v.vin} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 80px', borderBottom:'0.5px solid #D0DCE8', alignItems:'center' }}>
              <div style={{ padding:'10px 14px' }}>
                <div style={{ fontWeight:500, fontSize:13 }}>{v.vehicle_data?.year} {v.vehicle_data?.make} {v.vehicle_data?.model}</div>
                <div style={{ fontSize:10.5, color:'#90A4AE', fontFamily:'monospace' }}>{v.vin}</div>
              </div>
              <div style={{ padding:'10px 14px', fontSize:12 }}>{v.mileage?.toLocaleString()} mi</div>
              <div style={{ padding:'10px 14px', fontSize:12, color:'#607D8B' }}>{v.last_service_date || '—'}</div>
              <div style={{ padding:'10px 14px' }}>
                <span className={`pill pill-${v.risk==='high'?'red':v.risk==='medium'?'amber':'green'}`} style={{ fontSize:11 }}>
                  {v.risk || 'Low'}
                </span>
              </div>
              <div style={{ padding:'10px 14px', fontSize:12 }}>{v.estimatedCost ? `$${v.estimatedCost.toLocaleString()}` : '—'}</div>
              <div style={{ padding:'10px 14px' }}>
                <button style={{ padding:'4px 9px', fontSize:11, height:'auto' }} onClick={() => {}}>Analyse</button>
              </div>
            </div>
          ))}
        </div>

        {analysis && (
          <div style={{ border:'0.5px solid #9FE1CB', borderRadius:12, overflow:'hidden' }}>
            <div style={{ padding:'10px 14px', background:'#E1F5EE', borderBottom:'0.5px solid #9FE1CB', display:'flex', alignItems:'center', gap:7, fontSize:12.5, fontWeight:500, color:'#085041' }}>
              <i className="ti ti-robot" style={{ fontSize:14, color:'#0F6E56' }} aria-hidden="true" />
              LUMI AI fleet analysis — {type}
            </div>
            <div style={{ padding:'14px 15px', fontSize:12.5, lineHeight:1.6, color:'#1C2B3A', whiteSpace:'pre-wrap' }}>{analysis}</div>
          </div>
        )}
      </div>
    </div>
  );
}
