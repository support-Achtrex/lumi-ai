// src/pages/VINPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import APIService from '../services/api';
import {
  Car,
  Search,
  Calendar,
  Fuel,
  Cog,
  Globe,
  Activity,
  CheckCircle2,
  AlertTriangle,
  FileText,
  MessageSquare,
  ClipboardCheck,
  Wrench,
  ShoppingCart,
  ShieldCheck
} from 'lucide-react';

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
      <div style={{ height:52, padding:'0 24px', borderBottom:'1px solid #EBF1F8', display:'flex', alignItems:'center', gap:10, background:'#fff', fontSize:14, fontWeight:600, color:'#1C2B3A', flexShrink:0 }}>
        <div style={{ width:32, height:32, background:'#E1F5EE', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', color:'#0F6E56' }}>
          <Car size={16} />
        </div>
        VIN Lookup & Intelligence
      </div>
      <div style={{ flex:1, padding:24, overflowY:'auto' }}>
        <form onSubmit={decode} style={{ display:'flex', gap:10, marginBottom:20 }}>
          <input value={vin} onChange={e => setVin(e.target.value)} placeholder="Enter 17-character VIN — e.g. 1FTFW1ET5EKE00001" style={{ flex:1, height:42, fontSize:13.5, borderRadius:8 }} maxLength={17} />
          <button type="submit" disabled={loading || !vin.trim()} className="btn-primary" style={{ padding:'0 24px', height:42, display:'flex', alignItems:'center', gap:8 }}>
            <Search size={16} />
            {loading ? 'Decoding...' : 'Decode VIN'}
          </button>
        </form>

        {error && <div style={{ padding:'12px 16px', background:'#FEE2E2', border:'1px solid #FCA5A5', borderRadius:8, color:'#991B1B', fontSize:13.5, marginBottom:16, display:'flex', alignItems:'center', gap:8 }}><AlertTriangle size={16} /> {error}</div>}

        {data && (
          <>
            <div className="card" style={{ marginBottom:20, padding:24 }}>
              <div style={{ display:'flex', gap:16, marginBottom:24, alignItems: 'center' }}>
                <div style={{ width:52, height:52, background:'linear-gradient(135deg, #00E5C1 0%, #0A2085 100%)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', flexShrink:0, boxShadow:'0 4px 16px rgba(10,32,133,0.2)' }}>
                  <Car size={26} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize:20, fontWeight:700, color:'#1C2B3A', letterSpacing:'-0.3px' }}>{specs.year} {specs.make} {specs.model} {specs.trim}</div>
                  <div style={{ fontSize:13, color:'#607D8B', marginTop:3 }}>VIN: <span style={{ fontFamily:'ui-monospace, monospace', color:'#1C2B3A', fontWeight:600, background:'#F1F5F9', padding:'2px 8px', borderRadius:4, border:'1px solid #E2E8F0' }}>{vin.toUpperCase()}</span></div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button style={{ width:36, height:36, padding:0, display:'flex', alignItems:'center', justifyContent:'center', background:'#F8FAFC', border:'1px solid #CBD5E1', borderRadius:'50%', color:'#64748B', cursor:'pointer' }}
                    onClick={() => navigate('/inspection', { state: { vin, vehicleContext: { year: specs.year, make: specs.make, model: specs.model, trim: specs.trim, vin } } })} title="Start inspection">
                    <ClipboardCheck size={17} />
                  </button>
                  <button style={{ width:36, height:36, padding:0, display:'flex', alignItems:'center', justifyContent:'center', background:'#F8FAFC', border:'1px solid #CBD5E1', borderRadius:'50%', color:'#64748B', cursor:'pointer' }}
                    onClick={() => navigate('/chat', { state: { vin, vehicleContext: { year: specs.year, make: specs.make, model: specs.model, trim: specs.trim, vin } } })} title="Ask AAIA">
                    <MessageSquare size={17} />
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize:13, fontWeight:700, color:'#475569', marginBottom:12, textTransform:'uppercase', letterSpacing:'0.5px' }}>Specifications</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:12 }}>
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
                    <div key={l} style={{ background:'#F8FAFC', border:'1px solid #E2E8F0', padding:'12px 14px', borderRadius:10 }}>
                      <div style={{ fontSize:10.5, color:'#94A3B8', marginBottom:4, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px' }}>{l}</div>
                      <div style={{ fontSize:13.5, color:'#1E293B', fontWeight:600, lineHeight:1.3 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {(pricing.tradeIn || pricing.privateParty || pricing.retail) && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'#475569', marginBottom:12, textTransform:'uppercase', letterSpacing:'0.5px' }}>Estimated Valuation</div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:12 }}>
                    <div style={{ background:'#fff', border:'1px solid #E2E8F0', padding:'14px 16px', borderRadius:12, boxShadow:'0 2px 8px rgba(0,0,0,0.02)' }}>
                      <div style={{ fontSize:11, color:'#64748B', marginBottom:4, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px' }}>Trade-in</div>
                      <div style={{ fontSize:20, color:'#1C2B3A', fontWeight:700, letterSpacing:'-0.5px' }}>${pricing.tradeIn?.toLocaleString()}</div>
                    </div>
                    <div style={{ background:'#ECFDF5', border:'1px solid #10B981', padding:'14px 16px', borderRadius:12, boxShadow:'0 4px 12px rgba(16,185,129,0.08)' }}>
                      <div style={{ fontSize:11, color:'#059669', marginBottom:4, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px' }}>Private Party</div>
                      <div style={{ fontSize:20, color:'#065F46', fontWeight:800, letterSpacing:'-0.5px' }}>${pricing.privateParty?.toLocaleString()}</div>
                    </div>
                    <div style={{ background:'#fff', border:'1px solid #E2E8F0', padding:'14px 16px', borderRadius:12, boxShadow:'0 2px 8px rgba(0,0,0,0.02)' }}>
                      <div style={{ fontSize:11, color:'#64748B', marginBottom:4, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px' }}>Retail Est.</div>
                      <div style={{ fontSize:20, color:'#1C2B3A', fontWeight:700, letterSpacing:'-0.5px' }}>${pricing.retail?.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              )}

              {openRecalls.length > 0 && (
                <div style={{ padding:'14px 18px', background:'#FFF5F5', border:'1px solid #FCA5A5', borderRadius:12, display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
                  <div style={{ width:36, height:36, background:'#FEE2E2', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', color:'#DC2626', flexShrink:0 }}>
                    <AlertTriangle size={18} />
                  </div>
                  <span style={{ fontSize:13.5, color:'#B91C1C', fontWeight:600 }}>
                    {openRecalls.length} open recall{openRecalls.length > 1 ? 's' : ''} — {openRecalls.map(r => r.component).join(' · ')}
                  </span>
                </div>
              )}

              {data.history && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'#475569', marginBottom:12, textTransform:'uppercase', letterSpacing:'0.5px' }}>Vehicle History</div>
                  <div style={{ background: 'linear-gradient(135deg, #ffffff, #F8FAFC)', border: '1px solid #CBD5E1', borderRadius: 14, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShieldCheck size={24} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1C2B3A', margin: '0 0 4px 0' }}>Vehicle History Records Found</h3>
                        <div style={{ fontSize: 13, color: '#607D8B' }}>Service records, title events, and ownership history indexed for this VIN.</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate('/history', { state:{ vin, vehicleContext: { year: specs.year, make: specs.make, model: specs.model, trim: specs.trim, vin } } })}
                      className="btn-primary" 
                      style={{ background: 'linear-gradient(135deg, #0A2085, #1E40AF)', border: 'none', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px' }}
                    >
                      {isUnlocked ? (
                        <><FileText size={16} /> View Full Report</>
                      ) : (
                        <><ShoppingCart size={16} /> Purchase Full Report</>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display:'flex', gap:10 }}>
              <button style={{ flex:1, height:40, fontSize:13, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }} onClick={() => navigate('/inspection', { state:{ vin, vehicleContext: { year: specs.year, make: specs.make, model: specs.model, trim: specs.trim, vin } } })}>
                <ClipboardCheck size={16} /> Start Inspection
              </button>
              <button style={{ flex:1, height:40, fontSize:13, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }} onClick={() => navigate('/diagnostics', { state:{ vin, vehicleContext: { year: specs.year, make: specs.make, model: specs.model, trim: specs.trim, vin } } })}>
                <Wrench size={16} /> Diagnostics
              </button>
              <button className="btn-primary" style={{ flex:1, height:40, fontSize:13, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }} onClick={() => navigate('/chat', { state:{ vin, vehicleContext: { year: specs.year, make: specs.make, model: specs.model, trim: specs.trim, vin } } })}>
                <MessageSquare size={16} /> Ask AAIA
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
