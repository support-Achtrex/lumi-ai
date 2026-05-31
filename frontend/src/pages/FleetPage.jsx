// src/pages/FleetPage.jsx
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import APIService from '../services/api';

export default function FleetPage() {
  const [loading,  setLoading]  = useState(false);
  const [analysis, setAnalysis] = useState('');
  
  // Add Vehicle Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState('vin'); // 'vin', 'ymmt', 'bulk'
  const [vehicles, setVehicles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [vinInput, setVinInput] = useState('');
  const [activeFleetId, setActiveFleetId] = useState(null);
  const [expandedVehicle, setExpandedVehicle] = useState(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1989 }, (_, i) => currentYear - i);

  const [ymmtYear, setYmmtYear] = useState('');
  const [ymmtMake, setYmmtMake] = useState('');
  const [ymmtModel, setYmmtModel] = useState('');
  const [ymmtTrim, setYmmtTrim] = useState('');
  const [makesList, setMakesList] = useState([]);
  const [modelsList, setModelsList] = useState([]);
  const [bulkFile, setBulkFile] = useState(null);

  useEffect(() => {
    if (!ymmtYear) { setMakesList([]); setYmmtMake(''); return; }
    fetch('https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car?format=json')
      .then(r => r.json()).then(d => setMakesList(d.Results.map(m => m.MakeName).sort())).catch(console.error);
  }, [ymmtYear]);

  useEffect(() => {
    if (!ymmtYear || !ymmtMake) { setModelsList([]); setYmmtModel(''); return; }
    fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${ymmtMake}/modelyear/${ymmtYear}?format=json`)
      .then(r => r.json()).then(d => setModelsList(d.Results.map(m => m.Model_Name).sort())).catch(console.error);
  }, [ymmtYear, ymmtMake]);

  // Initial Data Load
  useEffect(() => {
    async function init() {
      try {
        let fleets = await APIService.getFleets();
        if (fleets.length === 0) {
          const newFleet = await APIService.createFleet('My Fleet', 'Default fleet');
          fleets = [newFleet];
        }
        setActiveFleetId(fleets[0].id);
        const v = await APIService.getFleetVehicles(fleets[0].id);
        setVehicles(v || []);
      } catch (err) {
        console.error('Failed to init fleet:', err);
      }
    }
    init();
  }, []);

  async function runLumiFleetAnalysis() {
    if (!activeFleetId || vehicles.length === 0) return;
    setLoading(true);
    setAnalysis('');
    try {
      const res = await APIService.analyseFleet(activeFleetId, 'maintenance');
      setAnalysis(res.analysis || 'LUMI AI analyzed the fleet but found no pressing issues.');
    } catch (err) {
      console.error(err);
      setAnalysis('Failed to run fleet analysis.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddVehicle(e) {
    e.preventDefault();
    if (addMode === 'vin' && !vinInput.trim()) return;
    if (addMode === 'ymmt' && (!ymmtYear || !ymmtMake || !ymmtModel)) return alert('Year, Make, and Model are required.');
    if (addMode === 'bulk' && !bulkFile) return alert('Please select a CSV file.');

    setUploading(true);
    try {
      if (addMode === 'vin') {
        await APIService.addVehiclesToFleet(activeFleetId, [vinInput.trim()]);
      } else if (addMode === 'ymmt') {
        await APIService.addVehicleByYMMT(activeFleetId, { year: ymmtYear, make: ymmtMake, model: ymmtModel, trim: ymmtTrim });
      } else if (addMode === 'bulk') {
        const text = await bulkFile.text();
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const vinIndex = headers.findIndex(h => h.includes('vin'));
        if (vinIndex === -1) {
          alert('No VIN column found in CSV.');
          setUploading(false);
          return;
        }
        const vins = [];
        for(let i=1; i<lines.length; i++) {
          const cols = lines[i].split(',');
          if (cols[vinIndex] && cols[vinIndex].trim().length === 17) {
            vins.push(cols[vinIndex].trim());
          }
        }
        if (vins.length === 0) {
          alert('No valid 17-character VINs found in the file.');
          setUploading(false);
          return;
        }
        await APIService.addVehiclesToFleet(activeFleetId, vins);
      }

      const v = await APIService.getFleetVehicles(activeFleetId);
      setVehicles(v || []);
      setShowAddModal(false);
      setVinInput('');
      setYmmtYear(''); setYmmtMake(''); setYmmtModel(''); setYmmtTrim('');
      setBulkFile(null);
    } catch (err) {
      console.error('Failed to add vehicle:', err);
      alert('Error adding vehicle(s). Please verify your inputs.');
    } finally {
      setUploading(false);
    }
  }

  const riskData = [
    { name: 'Low Risk', value: vehicles.filter(v => (v.risk || 'low') === 'low').length, color: '#10b981' },
    { name: 'Medium Risk', value: vehicles.filter(v => (v.risk || 'low') === 'medium').length, color: '#f59e0b' },
    { name: 'High Risk', value: vehicles.filter(v => (v.risk || 'low') === 'high').length, color: '#ef4444' }
  ].filter(d => d.value > 0);

  const avgSentiment = vehicles.length ? Math.round(vehicles.reduce((acc, v) => acc + (v.sentiment || 80), 0) / vehicles.length) : 0;

  const mileageData = vehicles.slice(0, 5).map(v => ({
    name: `${v.vehicle_data?.make || ''} ${v.vehicle_data?.model || ''}`.trim() || v.vin.substring(0,6),
    mileage: v.mileage || 0
  }));

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background: 'transparent', position: 'relative' }}>
      
      <div style={{ height:64, padding:'0 24px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(255,255,255,0.7)', backdropFilter:'blur(16px)', borderBottom:'1px solid var(--bord)', flexShrink:0, zIndex:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:15, fontWeight:600, color:'var(--dgray)' }}>
          <div style={{ width:36, height:36, background:'linear-gradient(135deg, var(--dblu), var(--mid))', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', boxShadow:'var(--shadow-md)' }}>
            <i className="ti ti-truck" style={{ fontSize:18 }} aria-hidden="true" />
          </div>
          Fleet Intelligence
        </div>
        <div style={{ display:'flex', gap:12 }}>
          <button className="btn-primary" onClick={runLumiFleetAnalysis} disabled={loading}>
            {loading ? <span className="loading-dot" /> : <i className="ti ti-activity" />}
            Deep Fleet Analysis
          </button>
          <button className="btn-teal" onClick={() => setShowAddModal(true)}>
            <i className="ti ti-plus" /> Add Vehicle
          </button>
        </div>
      </div>

      <div style={{ flex:1, padding:24, overflowY:'auto' }}>
        
            {analysis ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, marginBottom: 24 }}>
                  <div className="card" style={{ padding: 24, background: 'var(--white)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--mgray)', textTransform: 'uppercase', marginBottom: 16 }}>Fleet Health Score</div>
                    <div style={{ fontSize: 48, fontWeight: 800, color: avgSentiment > 80 ? 'var(--green)' : avgSentiment > 50 ? 'var(--amber)' : 'var(--red)' }}>
                      {avgSentiment}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--sgray)', marginTop: 8 }}>Avg. Sentiment across {vehicles.length} vehicles</div>
                  </div>

                  <div className="card" style={{ padding: 24, background: 'var(--white)' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--mgray)', textTransform: 'uppercase', marginBottom: 16 }}>Risk Distribution</div>
                    <div style={{ height: 140, width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={riskData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5}>
                            {riskData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="card" style={{ padding: 24, background: 'var(--white)' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--mgray)', textTransform: 'uppercase', marginBottom: 16 }}>Top Mileage (Miles)</div>
                    <div style={{ height: 140, width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={mileageData} margin={{ left: -20 }}>
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} width={100} tickFormatter={(val) => val.length > 10 ? val.substring(0,10)+'...' : val} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                          <Bar dataKey="mileage" fill="var(--teal)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                
                <div className="card animate-fade-in" style={{ padding: 24, marginBottom: 24, background: 'var(--white)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                    <span className="pill pill-teal" style={{ marginRight: 8 }}><i className="ti ti-bulb" /> AI Insight</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--mgray)' }}>Fleet Analysis Summary</span>
                  </div>
                  <div className="markdown-body" style={{ fontSize: 14, color: 'var(--dgray)', lineHeight: 1.6 }}>
                    <ReactMarkdown>{analysis}</ReactMarkdown>
                  </div>
                </div>
              </>
            ) : (
              <div className="card animate-fade-in" style={{ padding: 48, marginBottom: 24, background: 'linear-gradient(135deg, var(--white), #f8fafc)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', border: '1px dashed var(--bord)' }}>
                <div style={{ width: 64, height: 64, borderRadius: 32, background: 'rgba(13,148,136,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                  <i className="ti ti-chart-pie" style={{ fontSize: 32, color: 'var(--teal)' }} />
                </div>
                <h3 style={{ fontSize: 20, color: 'var(--dgray)', marginBottom: 12, fontFamily: 'var(--display)' }}>Unlock Predictive Fleet Insights</h3>
                <p style={{ fontSize: 14, color: 'var(--sgray)', maxWidth: 480, lineHeight: 1.6, marginBottom: 24 }}>
                  LUMI AI processes your vehicle mileage, diagnostic codes, and maintenance history to forecast breakdowns, identify high-risk assets, and build a proactive 90-day service schedule. 
                </p>
                <button className="btn-primary" onClick={runLumiFleetAnalysis} disabled={loading} style={{ padding: '12px 24px', fontSize: 15 }}>
                  {loading ? <span className="loading-dot" /> : <i className="ti ti-activity" />}
                  Run Deep Fleet Analysis
                </button>
              </div>
            )}

        {/* Predictive Vehicle List */}
        <h3 style={{ fontSize: 16, marginBottom: 16, marginTop: 32, color: 'var(--dgray)', fontFamily: 'var(--display)' }}>Predictive Maintenance Monitoring ({vehicles.length} Vehicles)</h3>
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1.5fr 2fr', background:'rgba(249,250,251,0.5)', borderBottom:'1px solid var(--bord)', padding: '12px 16px', fontSize: 12, fontWeight: 600, color: 'var(--mgray)', textTransform: 'uppercase' }}>
            <div>Vehicle</div>
            <div>Mileage</div>
            <div>Sentiment</div>
            <div>Risk Level</div>
            <div>LUMI Alert</div>
          </div>
          {vehicles.map(v => (
            <div key={v.vin}>
              <div 
                style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1.5fr 2fr', padding: '16px', borderBottom:'1px solid var(--lgray)', alignItems: 'center', transition: 'background 0.2s', cursor: 'pointer', background: expandedVehicle === v.vin ? 'rgba(255,255,255,0.7)' : 'transparent' }} 
                onMouseOver={e => e.currentTarget.style.background = expandedVehicle === v.vin ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.5)'} 
                onMouseOut={e => e.currentTarget.style.background = expandedVehicle === v.vin ? 'rgba(255,255,255,0.7)' : 'transparent'}
                onClick={() => setExpandedVehicle(expandedVehicle === v.vin ? null : v.vin)}
              >
                <div>
                  <div style={{ fontWeight:600, fontSize:14, color: 'var(--dgray)', marginBottom: 2 }}>{v.vehicle_data?.year} {v.vehicle_data?.make} {v.vehicle_data?.model}</div>
                  <div style={{ fontSize:11, color:'var(--sgray)', fontFamily:'var(--mono)' }}>{v.vin}</div>
                </div>
                <div style={{ fontSize:13, color: 'var(--dgray)', fontWeight: 500 }}>{(v.mileage || 0).toLocaleString()} mi</div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 32, height: 4, background: 'var(--lgray)', borderRadius: 2 }}>
                      <div style={{ width: `${v.sentiment || 80}%`, height: '100%', background: (v.sentiment || 80) > 80 ? 'var(--green)' : (v.sentiment || 80) > 50 ? 'var(--amber)' : 'var(--red)', borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--mgray)' }}>{v.sentiment || 80}</span>
                  </div>
                </div>
                <div>
                  <span className={`pill ${(v.risk || 'low') === 'high' ? 'pill-red' : (v.risk || 'low') === 'medium' ? 'pill-amber' : 'pill-green'}`}>{v.risk || 'low'}</span>
                </div>
                <div style={{ fontSize:13, color: v.alert ? 'var(--red)' : 'var(--mgray)', lineHeight: 1.4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {v.alert ? (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                      <i className="ti ti-alert-triangle" style={{ marginTop: 2 }} />
                      {v.alert}
                    </div>
                  ) : <span>System nominal</span>}
                  <i className={`ti ti-chevron-${expandedVehicle === v.vin ? 'up' : 'down'}`} style={{ color: 'var(--mgray)' }} />
                </div>
              </div>
              {expandedVehicle === v.vin && (
                <div style={{ padding: '24px', background: 'rgba(255,255,255,0.9)', borderBottom: '1px solid var(--lgray)', animation: 'fadeIn 0.3s' }}>
                  <div style={{ display: 'flex', gap: 32 }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: 12, color: 'var(--mgray)', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 0.5 }}>Vehicle Specifications</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px', fontSize: 13 }}>
                        <div style={{ color: 'var(--sgray)' }}>Engine:</div><div style={{ fontWeight: 500, color: 'var(--dgray)' }}>{v.vehicle_data?.engine || 'N/A'}</div>
                        <div style={{ color: 'var(--sgray)' }}>Body Type:</div><div style={{ fontWeight: 500, color: 'var(--dgray)' }}>{v.vehicle_data?.type || 'N/A'}</div>
                        <div style={{ color: 'var(--sgray)' }}>Trim Level:</div><div style={{ fontWeight: 500, color: 'var(--dgray)' }}>{v.vehicle_data?.trim || 'Standard'}</div>
                        <div style={{ color: 'var(--sgray)' }}>Last Service:</div><div style={{ fontWeight: 500, color: 'var(--dgray)' }}>{v.last_service_date ? new Date(v.last_service_date).toLocaleDateString() : 'Unknown'}</div>
                      </div>
                    </div>
                    <div style={{ flex: 1.5 }}>
                      <h4 style={{ fontSize: 12, color: 'var(--mgray)', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 0.5 }}>Diagnostic Status</h4>
                      <div style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--dgray)', padding: '16px', background: 'var(--offwh)', borderRadius: 8, border: '1px solid var(--bord)' }}>
                        {v.alert ? (
                          <>
                            <div style={{ fontWeight: 600, color: 'var(--red)', marginBottom: 8 }}><i className="ti ti-alert-triangle" /> Critical Alert Detected</div>
                            {v.alert}
                          </>
                        ) : (
                          <>
                            <div style={{ fontWeight: 600, color: 'var(--green)', marginBottom: 8 }}><i className="ti ti-check" /> All Systems Nominal</div>
                            No critical issues detected. Vehicle operating within normal parameters. Routine maintenance schedule should be followed.
                          </>
                        )}
                        {v.notes && <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--bord)', fontStyle: 'italic', color: 'var(--sgray)' }}>Agent Note: {v.notes}</div>}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Vehicle Modal Overlay */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div className="card animate-fade-in" style={{ width: 500, background: 'var(--white)', overflow: 'hidden' }}>
            <div className="card-header">
              <h3 style={{ fontSize: 16, fontFamily: 'var(--display)' }}>Add Vehicle to Fleet</h3>
              <i className="ti ti-x" style={{ cursor: 'pointer', fontSize: 18, color: 'var(--mgray)' }} onClick={() => setShowAddModal(false)} />
            </div>
            
            <div style={{ display: 'flex', borderBottom: '1px solid var(--bord)' }}>
              {[{id:'vin', l:'By VIN'}, {id:'ymmt', l:'By YMMT'}, {id:'bulk', l:'Bulk Upload'}].map(t => (
                <div key={t.id} onClick={() => setAddMode(t.id)} style={{ flex: 1, textAlign: 'center', padding: '12px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: addMode === t.id ? 'var(--teal-dk)' : 'var(--mgray)', borderBottom: addMode === t.id ? '2px solid var(--teal)' : '2px solid transparent' }}>
                  {t.l}
                </div>
              ))}
            </div>

            <div className="card-body">
              {addMode === 'vin' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <label style={{ fontSize: 13, fontWeight: 600 }}>Vehicle Identification Number (VIN)</label>
                  <input value={vinInput} onChange={e => setVinInput(e.target.value)} placeholder="Enter 17-character VIN" style={{ height: 40 }} />
                  <div style={{ fontSize: 12, color: 'var(--sgray)' }}>LUMI will automatically decode the VIN to fetch make, model, year, and specifications.</div>
                </div>
              )}

              {addMode === 'ymmt' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600 }}>Year</label>
                    <select value={ymmtYear} onChange={e => setYmmtYear(e.target.value)} style={{ height: 40 }}>
                      <option value="">Select Year</option>
                      {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600 }}>Make</label>
                    <select value={ymmtMake} onChange={e => setYmmtMake(e.target.value)} disabled={!ymmtYear} style={{ height: 40 }}>
                      <option value="">Select Make</option>
                      {makesList.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600 }}>Model</label>
                    <select value={ymmtModel} onChange={e => setYmmtModel(e.target.value)} disabled={!ymmtMake} style={{ height: 40 }}>
                      <option value="">Select Model</option>
                      {modelsList.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600 }}>Trim (Optional)</label>
                    <input value={ymmtTrim} onChange={e => setYmmtTrim(e.target.value)} placeholder="e.g. XLE" style={{ height: 40 }} />
                  </div>
                </div>
              )}

              {addMode === 'bulk' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ border: '2px dashed var(--lgray)', borderRadius: 8, padding: 32, textAlign: 'center', background: 'var(--offwh)', position: 'relative' }}>
                    <input type="file" accept=".csv" onChange={e => setBulkFile(e.target.files[0])} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                    <i className="ti ti-file-spreadsheet" style={{ fontSize: 32, color: 'var(--mgray)', marginBottom: 12 }} />
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--dgray)', marginBottom: 4 }}>
                      {bulkFile ? bulkFile.name : 'Drag & Drop file here'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--sgray)' }}>Supports .CSV (Max 500 rows)</div>
                    {!bulkFile && <button className="btn-primary" style={{ marginTop: 16, height: 32, fontSize: 12 }}>Browse Files</button>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--sgray)' }}>File must contain a column named "VIN". LUMI will process and decode vehicles automatically in the background.</div>
                </div>
              )}
            </div>

            <div style={{ padding: '16px 20px', background: 'var(--offwh)', borderTop: '1px solid var(--bord)', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>Cancel</button>
              <button className="btn-teal" onClick={handleAddVehicle} disabled={uploading}>
                {uploading ? <span className="loading-dot" /> : 'Confirm & Add'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
