import React, { useState, useEffect } from 'react';
import APIService from '../services/api';

const PartsPage = () => {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState('ymmt'); // vin, ymmt, oem
  const [vin, setVin] = useState('');
  const [oem, setOem] = useState('');
  const [year, setYear] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [trim, setTrim] = useState('');
  const [loading, setLoading] = useState(false);
  const [vehicleInfo, setVehicleInfo] = useState(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [partSearch, setPartSearch] = useState('');
  const [partDetails, setPartDetails] = useState(null);
  const [selectedSchemaPart, setSelectedSchemaPart] = useState(null);

  // YMMT State
  const [years, setYears] = useState([]);
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);

  useEffect(() => {
    APIService.getYears().then(y => setYears(y || [])).catch(console.error);
  }, []);

  useEffect(() => {
    if (year) APIService.getMakes(year).then(m => setMakes(m || [])).catch(console.error);
    setMake(''); setModel(''); setTrim('');
  }, [year]);

  useEffect(() => {
    if (year && make) APIService.getModels(make, year).then(m => setModels(m || [])).catch(console.error);
    setModel(''); setTrim('');
  }, [year, make]);

  const handleVehicleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    let query = {};
    if (mode === 'vin') query = { vin };
    else if (mode === 'oem') query = { oem };
    else if (mode === 'ymmt') query = { year, make, model, trim };

    try {
      if (mode === 'oem') {
        const res = await APIService.getPartDetails(oem, null);
        setPartDetails(res.data);
        setStep(3);
      } else {
        const res = await APIService.suggestParts(mode, query);
        setVehicleInfo(res.vehicleInfo);
        setAiPrompt(res.prompt);
        setSuggestions(res.suggestions || []);
        setStep(2);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to AI backend.');
    } finally {
      setLoading(false);
    }
  };

  const handlePartSearch = async (query) => {
    setLoading(true);
    setPartSearch('');
    try {
      const res = await APIService.getPartDetails(query, vehicleInfo);
      setPartDetails(res.data);
      setStep(3);
    } catch (err) {
      console.error(err);
      alert('Failed to get part details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F4F7FB' }}>
      
      {/* ─────────────────────────────────────────────────────────────────
          STEP 1: IMMERSIVE HERO SEARCH
      ───────────────────────────────────────────────────────────────── */}
      {step === 1 && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, animation: 'fadeIn 0.5s ease-out' }}>
          <div style={{ 
            maxWidth: 800, width: '100%', background: '#fff', borderRadius: 24, 
            boxShadow: '0 24px 60px rgba(0,0,0,0.08)', overflow: 'hidden', display: 'flex', flexDirection: 'column' 
          }}>
            <div style={{ padding: '24px 40px', background: 'linear-gradient(135deg, var(--dblu), var(--mid))', color: '#fff', textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 12px', backdropFilter: 'blur(10px)' }}>
                <i className="ti ti-settings" />
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>Find Your Part</h1>
              <p style={{ fontSize: 15, margin: 0, opacity: 0.9 }}>Connect to AAIA's global automotive database to identify, source, and analyze parts in seconds.</p>
            </div>

            <div style={{ padding: '24px 40px' }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 24, background: '#F5F8FC', padding: 8, borderRadius: 16 }}>
                {['vin', 'ymmt', 'oem'].map((m) => (
                  <button
                    key={m}
                    onClick={() => { setMode(m); }}
                    style={{
                      flex: 1, padding: '12px', border: 'none', borderRadius: 12, cursor: 'pointer',
                      background: mode === m ? '#fff' : 'transparent',
                      color: mode === m ? 'var(--dblu)' : 'var(--gray)',
                      fontWeight: mode === m ? 700 : 500,
                      boxShadow: mode === m ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                      transition: 'all 0.2s', fontSize: 14
                    }}
                  >
                    {m === 'vin' ? 'VIN Decode' : m === 'ymmt' ? 'Make & Model' : 'OEM Number'}
                  </button>
                ))}
              </div>

              <form onSubmit={handleVehicleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {mode === 'vin' && (
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--dgray)', marginBottom: 8, letterSpacing: '0.5px' }}>VEHICLE IDENTIFICATION NUMBER</label>
                    <input type="text" style={{ width: '100%', padding: '16px 20px', fontSize: 16, border: '2px solid #E2E8F0', borderRadius: 12, outline: 'none', transition: 'border-color 0.2s' }} placeholder="Enter 17-character VIN..." value={vin} onChange={e => setVin(e.target.value)} required />
                  </div>
                )}
                {mode === 'oem' && (
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--dgray)', marginBottom: 8, letterSpacing: '0.5px' }}>OEM PART NUMBER</label>
                    <input type="text" style={{ width: '100%', padding: '16px 20px', fontSize: 16, border: '2px solid #E2E8F0', borderRadius: 12, outline: 'none', transition: 'border-color 0.2s' }} placeholder="e.g. 90915-YZZF1" value={oem} onChange={e => setOem(e.target.value)} required />
                  </div>
                )}
                {mode === 'ymmt' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--dgray)', marginBottom: 8, letterSpacing: '0.5px' }}>YEAR</label>
                      <select style={{ width: '100%', padding: '16px 20px', fontSize: 16, border: '2px solid #E2E8F0', borderRadius: 12, outline: 'none', background: '#fff', cursor: 'pointer' }} value={year} onChange={e => setYear(e.target.value)} required>
                        <option value="">Select Year...</option>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--dgray)', marginBottom: 8, letterSpacing: '0.5px' }}>MAKE</label>
                      <select style={{ width: '100%', padding: '16px 20px', fontSize: 16, border: '2px solid #E2E8F0', borderRadius: 12, outline: 'none', background: '#fff', cursor: 'pointer' }} value={make} onChange={e => setMake(e.target.value)} required disabled={!year}>
                        <option value="">Select Make...</option>
                        {makes.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--dgray)', marginBottom: 8, letterSpacing: '0.5px' }}>MODEL</label>
                      <select style={{ width: '100%', padding: '16px 20px', fontSize: 16, border: '2px solid #E2E8F0', borderRadius: 12, outline: 'none', background: '#fff', cursor: 'pointer' }} value={model} onChange={e => setModel(e.target.value)} required disabled={!make}>
                        <option value="">Select Model...</option>
                        {models.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--dgray)', marginBottom: 8, letterSpacing: '0.5px' }}>TRIM (Optional)</label>
                      <input type="text" style={{ width: '100%', padding: '16px 20px', fontSize: 16, border: '2px solid #E2E8F0', borderRadius: 12, outline: 'none' }} placeholder="e.g. SE, Limited" value={trim} onChange={e => setTrim(e.target.value)} />
                    </div>
                  </div>
                )}

                <button type="submit" style={{ 
                  marginTop: 20, padding: '18px', fontSize: 18, fontWeight: 700, borderRadius: 12, border: 'none',
                  background: 'var(--dblu)', color: '#fff', cursor: 'pointer', transition: 'all 0.2s',
                  boxShadow: '0 8px 24px rgba(23,107,255,0.3)', opacity: loading ? 0.7 : 1
                }} disabled={loading}>
                  {loading ? <span className="loading-dot" /> : 'Search Database'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          STEP 2 & 3: NEW PAGE DASHBOARD (CHAT + RESULTS)
      ───────────────────────────────────────────────────────────────── */}
      {step >= 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', animation: 'slideUp 0.4s ease-out' }}>
          {/* Header Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', background: '#fff', borderBottom: '1px solid var(--bord)' }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: 'var(--dgray)' }}>Parts Workspace</h2>
              <div style={{ fontSize: 13, color: 'var(--gray)', marginTop: 4 }}>
                {vehicleInfo ? `${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model} ${vehicleInfo.trim}` : `OEM: ${oem}`}
              </div>
            </div>
            <button 
              onClick={() => { setStep(1); setPartDetails(null); setSuggestions([]); }}
              style={{ background: '#F5F8FC', border: 'none', padding: '10px 20px', borderRadius: 8, color: 'var(--dblu)', fontWeight: 600, cursor: 'pointer', transition: '0.2s', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <i className="ti ti-arrow-left" /> Start Over
            </button>
          </div>

          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            
            {/* Left Side: AI Parts Assistant Chat */}
            <div style={{ width: 400, background: '#fff', borderRight: '1px solid var(--bord)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: 24, borderBottom: '1px solid var(--bord)', background: '#FAFCFF' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, var(--dblu), var(--mid))', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    <i className="ti ti-robot" style={{ fontSize: 20 }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--dgray)' }}>AAIA Parts Assistant</div>
                    <div style={{ fontSize: 12, color: 'var(--gray)' }}>Active Session</div>
                  </div>
                </div>
              </div>
              
              <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                {aiPrompt && (
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ width: 32, height: 32, background: 'var(--dblu)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                      <i className="ti ti-robot" style={{ fontSize: 16 }} />
                    </div>
                    <div style={{ background: '#F5F8FC', padding: 16, borderRadius: '0 16px 16px 16px', fontSize: 14, color: 'var(--dgray)', lineHeight: 1.5 }}>
                      {aiPrompt}
                    </div>
                  </div>
                )}
                
                {suggestions.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingLeft: 44 }}>
                    {suggestions.map((sug, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => handlePartSearch(sug)}
                        style={{ background: '#fff', border: '1px solid var(--bord)', padding: '8px 16px', borderRadius: 20, fontSize: 12, color: 'var(--dblu)', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600 }}
                        onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--dblu)'; e.currentTarget.style.background = '#F5F8FC'; }}
                        onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--bord)'; e.currentTarget.style.background = '#fff'; }}
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}

                {loading && (
                   <div style={{ display: 'flex', gap: 12 }}>
                     <div style={{ width: 32, height: 32, background: 'var(--dblu)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                       <i className="ti ti-robot" style={{ fontSize: 16 }} />
                     </div>
                     <div style={{ background: '#F5F8FC', padding: 16, borderRadius: '0 16px 16px 16px', fontSize: 14, color: 'var(--dgray)', display: 'flex', alignItems: 'center' }}>
                       <span className="loading-dot" />
                     </div>
                   </div>
                )}
              </div>
              
              <div style={{ padding: 24, borderTop: '1px solid var(--bord)', background: '#fff' }}>
                <div style={{ display: 'flex', gap: 12, background: '#F5F8FC', padding: 8, borderRadius: 12, border: '1px solid #E2E8F0' }}>
                  <input 
                    type="text" 
                    placeholder="Search any part (e.g. Brake Pads)..." 
                    style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', padding: '0 12px', fontSize: 14 }}
                    value={partSearch} 
                    onChange={e => setPartSearch(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handlePartSearch(partSearch)}
                    disabled={loading}
                  />
                  <button 
                    onClick={() => handlePartSearch(partSearch)} 
                    disabled={loading || !partSearch.trim()}
                    style={{ width: 40, height: 40, background: 'var(--dblu)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s', opacity: (loading || !partSearch.trim()) ? 0.5 : 1 }}
                  >
                    <i className="ti ti-arrow-up" style={{ fontSize: 20 }} />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side: Visual Parts Display */}
            <div style={{ flex: 1, padding: 40, overflowY: 'auto', background: '#F4F7FB' }}>
              {!partDetails && step === 2 && !loading && (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                  <i className="ti ti-shopping-cart-search" style={{ fontSize: 64, color: 'var(--dblu)', marginBottom: 16 }} />
                  <h3 style={{ fontSize: 20, color: 'var(--dgray)', margin: 0 }}>Select a part to view details</h3>
                  <p style={{ color: 'var(--gray)', marginTop: 8 }}>Use the chat assistant on the left to find parts.</p>
                </div>
              )}

              {partDetails && (
                <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                    <h3 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: 'var(--dgray)' }}>Detailed Specifications</h3>
                    {partDetails.category && (
                      <span style={{ background: 'var(--lmid)', color: 'var(--dblu)', padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                        {partDetails.category} {partDetails.sub_category ? ` / ${partDetails.sub_category}` : ''}
                      </span>
                    )}
                  </div>

                  {partDetails.parts ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
                      {partDetails.parts.map((p, idx) => (
                        <div key={idx} style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                          <div style={{ height: 200, background: '#f0f0f0', position: 'relative' }}>
                            {p.images && p.images[0] ? (
                              <img src={p.images[0]} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                                <i className="ti ti-photo" style={{ fontSize: 48 }} />
                              </div>
                            )}
                            <div style={{ position: 'absolute', top: 16, right: 16, background: '#fff', padding: '6px 12px', borderRadius: 20, fontSize: 14, fontWeight: 800, color: 'var(--dgray)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                              {p.price || 'N/A'}
                            </div>
                          </div>
                          <div style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <h4 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px 0', color: 'var(--dgray)', lineHeight: 1.3 }}>{p.title}</h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                              <span style={{ fontSize: 12, color: 'var(--gray)', fontWeight: 600 }}>OEM: {p.part_number}</span>
                            </div>
                            <p style={{ fontSize: 14, color: '#555', margin: '0 0 20px 0', lineHeight: 1.5, flex: 1 }}>{p.description}</p>
                            
                            <button 
                              onClick={() => setSelectedSchemaPart(p)}
                              style={{ width: '100%', padding: '12px', background: '#F5F8FC', border: '1px solid var(--bord)', borderRadius: 10, color: 'var(--dblu)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', transition: '0.2s' }} 
                              onMouseOver={e => { e.currentTarget.style.background = 'var(--dblu)'; e.currentTarget.style.color = '#fff'; }} 
                              onMouseOut={e => { e.currentTarget.style.background = '#F5F8FC'; e.currentTarget.style.color = 'var(--dblu)'; }}>
                              <i className="ti ti-file-analytics" /> View Schematics
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ background: '#fff', padding: 40, borderRadius: 16, textAlign: 'center', color: 'var(--gray)' }}>
                      No parts data available for this query.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          SCHEMA MODAL
      ───────────────────────────────────────────────────────────────── */}
      {selectedSchemaPart && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'fadeIn 0.3s ease-out' }}>
          <div style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 900, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--bord)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: 'var(--dgray)' }}>Part Schematics & Details</h2>
              <button onClick={() => setSelectedSchemaPart(null)} style={{ background: 'transparent', border: 'none', fontSize: 24, color: 'var(--gray)', cursor: 'pointer' }}>&times;</button>
            </div>
            <div style={{ padding: 32, overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'flex', gap: 32, flexDirection: 'column' }}>
                {/* Images */}
                <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16 }}>
                  {selectedSchemaPart.images && selectedSchemaPart.images.length > 0 ? (
                    selectedSchemaPart.images.map((img, i) => (
                      <img key={i} src={img} alt={`Schema ${i}`} style={{ height: 240, borderRadius: 12, objectFit: 'cover', border: '1px solid var(--bord)' }} />
                    ))
                  ) : (
                    <div style={{ width: '100%', height: 240, background: '#f0f0f0', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                      <i className="ti ti-photo" style={{ fontSize: 48 }} />
                    </div>
                  )}
                </div>
                
                {/* Info */}
                <div>
                  <h3 style={{ fontSize: 28, margin: '0 0 16px 0', color: 'var(--dblu)', fontWeight: 800 }}>{selectedSchemaPart.title}</h3>
                  <div style={{ display: 'flex', gap: 24, marginBottom: 24, flexWrap: 'wrap' }}>
                    <div style={{ background: '#F5F8FC', padding: '16px 24px', borderRadius: 12, flex: 1, minWidth: 200 }}>
                      <div style={{ fontSize: 12, color: 'var(--gray)', fontWeight: 700, marginBottom: 4 }}>PRICE</div>
                      <div style={{ fontSize: 24, color: 'var(--dgray)', fontWeight: 800 }}>{selectedSchemaPart.price || 'N/A'}</div>
                    </div>
                    <div style={{ background: '#F5F8FC', padding: '16px 24px', borderRadius: 12, flex: 1, minWidth: 200 }}>
                      <div style={{ fontSize: 12, color: 'var(--gray)', fontWeight: 700, marginBottom: 4 }}>OEM PART #</div>
                      <div style={{ fontSize: 20, color: 'var(--dgray)', fontWeight: 700 }}>{selectedSchemaPart.part_number}</div>
                    </div>
                  </div>
                  
                  {selectedSchemaPart.alternate_names && (
                    <div style={{ marginBottom: 24 }}>
                      <h4 style={{ fontSize: 14, color: 'var(--gray)', fontWeight: 700, marginBottom: 8 }}>ALTERNATE NAMES</h4>
                      <p style={{ margin: 0, fontSize: 16, color: 'var(--dgray)' }}>{selectedSchemaPart.alternate_names}</p>
                    </div>
                  )}
                  
                  <div>
                    <h4 style={{ fontSize: 14, color: 'var(--gray)', fontWeight: 700, marginBottom: 8 }}>TECHNICAL DESCRIPTION</h4>
                    <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: 'var(--dgray)' }}>{selectedSchemaPart.description}</p>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ padding: '24px 32px', borderTop: '1px solid var(--bord)', background: '#FAFCFF', textAlign: 'right' }}>
              <button onClick={() => setSelectedSchemaPart(null)} style={{ padding: '12px 32px', background: 'var(--dblu)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default PartsPage;
