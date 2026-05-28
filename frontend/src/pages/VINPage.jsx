// src/pages/VINPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import APIService from '../services/api';

export default function VINPage() {
  const [vin,     setVin]     = useState('');
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const navigate = useNavigate();

  async function decode(e) {
    e?.preventDefault();
    if (!vin.trim()) return;
    setLoading(true); setError('');
    try {
      const result = await APIService.getVehicleFull(vin.trim().toUpperCase(), null);
      setData(result);
    } catch (err) {
      setError(err.message || 'VIN not found');
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  const specs = data?.specifications || {};
  const pricing = data?.pricing || {};
  const recalls = data?.recalls || [];
  const openRecalls = recalls.filter?.(r => r.status === 'open') || [];

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <div style={{ height:46, padding:'0 18px', borderBottom:'0.5px solid #D0DCE8', display:'flex', alignItems:'center', gap:8, background:'#fff', fontSize:13, fontWeight:500, color:'#1C2B3A', flexShrink:0 }}>
        <i className="ti ti-car" style={{ fontSize:15, color:'#607D8B' }} aria-hidden="true" /> VIN lookup
      </div>
      <div style={{ flex:1, padding:18, overflowY:'auto' }}>
        <form onSubmit={decode} style={{ display:'flex', gap:8, marginBottom:18 }}>
          <input value={vin} onChange={e => setVin(e.target.value)} placeholder="Enter VIN — e.g. 1FTFW1ET5EKE00001" style={{ flex:1, height:38, fontSize:13 }} maxLength={17} />
          <button type="submit" disabled={loading || !vin.trim()} className="btn-primary" style={{ padding:'0 20px', height:38 }}>
            {loading ? 'Looking up…' : 'Decode VIN'}
          </button>
        </form>

        {error && <div style={{ padding:'10px 14px', background:'#FCEBEB', border:'0.5px solid #F09595', borderRadius:8, color:'#A32D2D', fontSize:13, marginBottom:14 }}>{error}</div>}

        {data && (
          <>
            <div className="card" style={{ marginBottom:14 }}>
              <div className="card-header">
                <div>
                  <div style={{ fontSize:14, fontWeight:500, color:'#1C2B3A' }}>{specs.year} {specs.make} {specs.model} {specs.trim}</div>
                  <div style={{ fontSize:11, color:'#90A4AE', fontFamily:'monospace' }}>{vin.toUpperCase()}</div>
                </div>
                <div style={{ display:'flex', gap:5 }}>
                  <button style={{ width:28, height:28, padding:0, display:'flex', alignItems:'center', justifyContent:'center' }}
                    onClick={() => navigate('/inspection', { state: { vin } })} aria-label="Start inspection">
                    <i className="ti ti-clipboard-check" style={{ fontSize:14 }} aria-hidden="true" />
                  </button>
                  <button style={{ width:28, height:28, padding:0, display:'flex', alignItems:'center', justifyContent:'center' }}
                    onClick={() => navigate('/chat', { state: { vin } })} aria-label="Ask LUMI AI">
                    <i className="ti ti-message-2" style={{ fontSize:14 }} aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div className="grid3">
                {[['Engine', specs.engine],['Transmission', specs.transmission],['Drive', specs.driveType],
                  ['Fuel', specs.fuelType],['MPG', specs.cityMpg && `${specs.cityMpg} / ${specs.highwayMpg}`],['Body', specs.bodyStyle]]
                  .filter(([,v]) => v).map(([l,v]) => (
                  <div className="gc" key={l}><div className="label">{l}</div><div className="value">{v}</div></div>
                ))}
              </div>
              {(pricing.tradeIn || pricing.privateParty || pricing.retail) && (
                <div className="grid3" style={{ borderTop:'0.5px solid #D0DCE8' }}>
                  <div className="gc"><div className="label">Trade-in</div><div className="value">${pricing.tradeIn?.toLocaleString()}</div></div>
                  <div className="gc"><div className="label">Private party</div><div className="value" style={{ color:'#27500A' }}>${pricing.privateParty?.toLocaleString()}</div></div>
                  <div className="gc"><div className="label">Retail est.</div><div className="value">${pricing.retail?.toLocaleString()}</div></div>
                </div>
              )}
              {openRecalls.length > 0 && (
                <div style={{ padding:'9px 14px', background:'#FCEBEB', borderTop:'0.5px solid #F09595', display:'flex', alignItems:'center', gap:7 }}>
                  <i className="ti ti-alert-triangle" style={{ color:'#A32D2D', fontSize:15 }} aria-hidden="true" />
                  <span style={{ fontSize:12, color:'#791F1F' }}>{openRecalls.length} open recall{openRecalls.length > 1 ? 's' : ''} — {openRecalls.map(r => r.component).join(' · ')}</span>
                </div>
              )}
            </div>

            <div style={{ display:'flex', gap:8 }}>
              <button style={{ flex:1, height:36, fontSize:12 }} onClick={() => navigate('/inspection', { state:{ vin } })}>
                <i className="ti ti-clipboard-check" style={{ fontSize:13 }} aria-hidden="true" /> Start inspection
              </button>
              <button style={{ flex:1, height:36, fontSize:12 }} onClick={() => navigate('/diagnostics', { state:{ vin } })}>
                <i className="ti ti-tool" style={{ fontSize:13 }} aria-hidden="true" /> Diagnostics
              </button>
              <button className="btn-primary" style={{ flex:1, height:36, fontSize:12 }} onClick={() => navigate('/chat', { state:{ vin } })}>
                <i className="ti ti-message-2" style={{ fontSize:13 }} aria-hidden="true" /> Ask LUMI AI
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
