// src/pages/VINPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import APIService from '../services/api';

export default function VINPage() {
  const [vin,     setVin]     = useState('');
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const navigate = useNavigate();

  async function decode(e) {
    e?.preventDefault();
    if (!vin.trim()) return;
    setLoading(true); setError('');
    try {
      const result = await APIService.getVehicleFull(vin.trim().toUpperCase(), null);
      setData(result);
      
      APIService.checkUnlockedReport(vin.trim().toUpperCase())
        .then(res => setIsUnlocked(!!(res.success && res.unlocked)))
        .catch(() => setIsUnlocked(false));

    } catch (err) {
      setError(err.message || 'VIN not found');
      setData(null);
      setIsUnlocked(false);
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
              <div style={{ display:'flex', gap:12, marginBottom:20, alignItems: 'center' }}>
                <div style={{ width:48, height:48, background:'linear-gradient(135deg, #00C8A8 0%, #0F6E56 100%)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', flexShrink:0, boxShadow:'0 4px 12px rgba(15,110,86,0.2)' }}>
                  <i className="ti ti-car" style={{ fontSize:24 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize:18, fontWeight:600, color:'#1C2B3A', letterSpacing:'-0.3px' }}>{specs.year} {specs.make} {specs.model} {specs.trim}</div>
                  <div style={{ fontSize:13, color:'#607D8B', marginTop:2 }}>VIN: <span style={{ fontFamily:'ui-monospace, monospace', color:'#1C2B3A', fontWeight:500, background:'#F5F8FC', padding:'2px 6px', borderRadius:4, border:'1px solid #EBF1F8' }}>{vin.toUpperCase()}</span></div>
                </div>
                <div style={{ display:'flex', gap:5 }}>
                  <button style={{ width:32, height:32, padding:0, display:'flex', alignItems:'center', justifyContent:'center', background:'#F5F8FC', border:'1px solid #D0DCE8', borderRadius:'50%', color:'#607D8B' }}
                    onClick={() => navigate('/inspection', { state: { vin, vehicleContext: { year: specs.year, make: specs.make, model: specs.model, trim: specs.trim, vin } } })} title="Start inspection">
                    <i className="ti ti-clipboard-check" style={{ fontSize:16 }} aria-hidden="true" />
                  </button>
                  <button style={{ width:32, height:32, padding:0, display:'flex', alignItems:'center', justifyContent:'center', background:'#F5F8FC', border:'1px solid #D0DCE8', borderRadius:'50%', color:'#607D8B' }}
                    onClick={() => navigate('/chat', { state: { vin, vehicleContext: { year: specs.year, make: specs.make, model: specs.model, trim: specs.trim, vin } } })} title="Ask AAIA">
                    <i className="ti ti-message-2" style={{ fontSize:16 }} aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize:14, fontWeight:600, color:'#1C2B3A', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.5px' }}>Specifications</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:12 }}>
                  {[
                    ['Trim', specs.trim],
                    ['Body Style', specs.body_class],
                    ['Engine', specs.engine],
                    ['Transmission', specs.transmission],
                    ['Fuel Type', specs.fuel_type],
                    ['Drive Type', specs.drive_type],
                    ['Plant Country', specs.plant_country],
                    ['Manufacturer', specs.manufacturer]
                  ].filter(([,v]) => v && v !== 'Unknown' && v !== 'Not Applicable').map(([l,v]) => (
                    <div key={l} style={{ background:'#fff', border:'1px solid #EBF1F8', padding:'14px', borderRadius:12, boxShadow:'0 2px 8px rgba(0,0,0,0.02)' }}>
                      <div style={{ fontSize:11, color:'#90A4AE', marginBottom:4, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px' }}>{l}</div>
                      <div style={{ fontSize:14, color:'#1C2B3A', fontWeight:600, lineHeight:1.3 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {(pricing.tradeIn || pricing.privateParty || pricing.retail) && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize:14, fontWeight:600, color:'#1C2B3A', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.5px' }}>Market Value</div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:12 }}>
                    <div style={{ background:'#fff', border:'1px solid #EBF1F8', padding:'14px', borderRadius:12, boxShadow:'0 2px 8px rgba(0,0,0,0.02)' }}>
                      <div style={{ fontSize:11, color:'#90A4AE', marginBottom:4, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px' }}>Trade-in</div>
                      <div style={{ fontSize:18, color:'#1C2B3A', fontWeight:700, letterSpacing:'-0.5px' }}>${pricing.tradeIn?.toLocaleString()}</div>
                    </div>
                    <div style={{ background:'#EAF3DE', border:'1px solid #0F6E56', padding:'14px', borderRadius:12, boxShadow:'0 4px 12px rgba(15,110,86,0.1)' }}>
                      <div style={{ fontSize:11, color:'#0F6E56', marginBottom:4, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px' }}>Private Party</div>
                      <div style={{ fontSize:18, color:'#085041', fontWeight:700, letterSpacing:'-0.5px' }}>${pricing.privateParty?.toLocaleString()}</div>
                    </div>
                    <div style={{ background:'#fff', border:'1px solid #EBF1F8', padding:'14px', borderRadius:12, boxShadow:'0 2px 8px rgba(0,0,0,0.02)' }}>
                      <div style={{ fontSize:11, color:'#90A4AE', marginBottom:4, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px' }}>Retail Est.</div>
                      <div style={{ fontSize:18, color:'#1C2B3A', fontWeight:700, letterSpacing:'-0.5px' }}>${pricing.retail?.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              )}

              {openRecalls.length > 0 && (
                <div style={{ padding:'12px 16px', background:'#FFF5F5', border:'1px solid #FFE5E5', borderRadius:12, display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
                  <div style={{ width:32, height:32, background:'#FFE5E5', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', color:'#FF4D4D', flexShrink:0 }}>
                    <i className="ti ti-alert-triangle" style={{ fontSize:16 }} aria-hidden="true" />
                  </div>
                  <span style={{ fontSize:13, color:'#D32F2F', fontWeight:500 }}>
                    {openRecalls.length} open recall{openRecalls.length > 1 ? 's' : ''} — {openRecalls.map(r => r.component).join(' · ')}
                  </span>
                </div>
              )}

              {data.history && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize:14, fontWeight:600, color:'#1C2B3A', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.5px' }}>Vehicle History</div>
                  <div style={{ background: 'linear-gradient(135deg, #ffffff, #F5F8FC)', border: '1px solid #D0DCE8', borderRadius: 12, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="ti ti-alert-triangle" style={{ fontSize: 24 }} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1C2B3A', margin: '0 0 4px 0' }}>Multiple Records Found</h3>
                        <div style={{ fontSize: 13, color: '#607D8B' }}>14 service records, ownership history, and potential title events found for this VIN.</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate('/history', { state:{ vin, vehicleContext: { year: specs.year, make: specs.make, model: specs.model, trim: specs.trim, vin } } })}
                      className="btn-primary" 
                      style={{ background: 'linear-gradient(135deg, #1C2B3A, #3A506B)', border: 'none', boxShadow: '0 4px 12px rgba(28,43,58,0.2)' }}
                    >
                      {isUnlocked ? (
                        <><i className="ti ti-file-text" /> View Full Report</>
                      ) : (
                        <><i className="ti ti-shopping-cart" /> Purchase Full Report</>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display:'flex', gap:8 }}>
              <button style={{ flex:1, height:36, fontSize:12 }} onClick={() => navigate('/inspection', { state:{ vin, vehicleContext: { year: specs.year, make: specs.make, model: specs.model, trim: specs.trim, vin } } })}>
                <i className="ti ti-clipboard-check" style={{ fontSize:13 }} aria-hidden="true" /> Start inspection
              </button>
              <button style={{ flex:1, height:36, fontSize:12 }} onClick={() => navigate('/diagnostics', { state:{ vin, vehicleContext: { year: specs.year, make: specs.make, model: specs.model, trim: specs.trim, vin } } })}>
                <i className="ti ti-tool" style={{ fontSize:13 }} aria-hidden="true" /> Diagnostics
              </button>
              <button className="btn-primary" style={{ flex:1, height:36, fontSize:12 }} onClick={() => navigate('/chat', { state:{ vin, vehicleContext: { year: specs.year, make: specs.make, model: specs.model, trim: specs.trim, vin } } })}>
                <i className="ti ti-message-2" style={{ fontSize:13 }} aria-hidden="true" /> Ask AAIA
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
