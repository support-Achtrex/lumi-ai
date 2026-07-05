import React, { useState, useEffect } from 'react';
import APIService from '../services/api';
import ReactMarkdown from 'react-markdown';

export default function PartsPage() {
  const [mode, setMode] = useState('vin'); // 'vin', 'oem', 'ymmt'
  
  // Form state
  const [vin, setVin] = useState('');
  const [oem, setOem] = useState('');
  
  // YMMT State
  const [years, setYears] = useState([]);
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  
  const [year, setYear] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [trim, setTrim] = useState('');
  
  // AI Flow State
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Vehicle, 2: AI Suggestions, 3: Part Details
  
  const [vehicleInfo, setVehicleInfo] = useState(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  
  const [partSearch, setPartSearch] = useState('');
  const [partDetails, setPartDetails] = useState(null);

  // Load Years on mount
  useEffect(() => {
    APIService.getYears().then(setYears).catch(console.error);
  }, []);

  // Cascade Make
  useEffect(() => {
    if (year) {
      setMake(''); setModel(''); setModels([]);
      APIService.getMakes(year).then(setMakes).catch(console.error);
    }
  }, [year]);

  // Cascade Model
  useEffect(() => {
    if (year && make) {
      setModel('');
      APIService.getModels(make, year).then(setModels).catch(console.error);
    }
  }, [year, make]);

  const handleVehicleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStep(1);
    setPartDetails(null);
    setSuggestions([]);
    
    let query = {};
    if (mode === 'vin') query = { vin };
    else if (mode === 'oem') query = { oem };
    else if (mode === 'ymmt') query = { year, make, model, trim };

    try {
      if (mode === 'oem') {
        // Direct to details
        const res = await APIService.getPartDetails(oem, null);
        setPartDetails(res.data);
        setStep(3);
      } else {
        // Vehicle decode & suggestions
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'transparent' }}>
      <div style={{ padding: '32px 40px', borderBottom: '1px solid var(--bord)', background: 'var(--card)' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px 0', color: 'var(--dgray)' }}>AI Parts Lookup</h1>
        <p style={{ margin: 0, color: 'var(--gray)', fontSize: 14 }}>Powered by Grok & Gemini. Search by VIN, YMMT, or OEM.</p>
      </div>

      <div style={{ padding: 40, flex: 1, overflowY: 'auto' }}>
        
        {/* Step 1: Centered Search Form */}
        {step === 1 && (
          <div style={{ 
            maxWidth: 600, 
            margin: '40px auto', 
            background: 'var(--card)', 
            borderRadius: 16, 
            padding: 40, 
            boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
            border: '1px solid rgba(0,0,0,0.05)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, var(--dblu), var(--mid))', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 28, margin: '0 auto 16px' }}>
                <i className="ti ti-search" />
              </div>
              <h2 style={{ fontSize: 24, color: 'var(--dgray)', margin: '0 0 8px 0' }}>Find Your Part</h2>
              <p style={{ color: 'var(--gray)', fontSize: 14, margin: 0 }}>Search our intelligent database by VIN, YMMT, or OEM.</p>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 32, background: '#F5F8FC', padding: 6, borderRadius: 12 }}>
              {['vin', 'ymmt', 'oem'].map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setStep(1); }}
                  style={{
                    flex: 1, padding: '8px', border: 'none', borderRadius: 6, cursor: 'pointer',
                    background: mode === m ? '#fff' : 'transparent',
                    color: mode === m ? 'var(--dblu)' : 'var(--gray)',
                    fontWeight: mode === m ? 600 : 500,
                    boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  {m.toUpperCase()}
                </button>
              ))}
            </div>

            <form onSubmit={handleVehicleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {mode === 'vin' && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gray)', marginBottom: 6 }}>VEHICLE IDENTIFICATION NUMBER</label>
                  <input type="text" className="input-field" placeholder="Enter 17-character VIN" value={vin} onChange={e => setVin(e.target.value)} required />
                </div>
              )}
              {mode === 'oem' && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gray)', marginBottom: 6 }}>OEM PART NUMBER</label>
                  <input type="text" className="input-field" placeholder="e.g. 90915-YZZF1" value={oem} onChange={e => setOem(e.target.value)} required />
                </div>
              )}
              {mode === 'ymmt' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gray)', marginBottom: 6 }}>YEAR</label>
                    <select className="input-field" value={year} onChange={e => setYear(e.target.value)} required>
                      <option value="">Select Year</option>
                      {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gray)', marginBottom: 6 }}>MAKE</label>
                    <select className="input-field" value={make} onChange={e => setMake(e.target.value)} required disabled={!year}>
                      <option value="">Select Make</option>
                      {makes.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gray)', marginBottom: 6 }}>MODEL</label>
                    <select className="input-field" value={model} onChange={e => setModel(e.target.value)} required disabled={!make}>
                      <option value="">Select Model</option>
                      {models.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gray)', marginBottom: 6 }}>TRIM (Optional)</label>
                    <input type="text" className="input-field" placeholder="e.g. SE, Limited" value={trim} onChange={e => setTrim(e.target.value)} />
                  </div>
                </>
              )}

              <button type="submit" className="btn-primary" style={{ marginTop: 16, padding: '14px', fontSize: 16, borderRadius: 8 }} disabled={loading}>
                {loading && step === 1 ? <span className="loading-dot" /> : 'Search Database'}
              </button>
            </form>
          </div>
        )}

        {/* Step 2 & 3: Results Panel */}
        {step >= 2 && (
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <button 
              className="btn-outline" 
              style={{ marginBottom: 24, padding: '8px 16px', borderRadius: 20, fontSize: 13 }}
              onClick={() => { setStep(1); setPartDetails(null); setSuggestions([]); }}
            >
              <i className="ti ti-arrow-left" style={{ marginRight: 6 }} /> Back to Search
            </button>
            
            {/* Step 2: AI Conversational Suggestions */}
            {step === 2 && vehicleInfo && (
              <div style={{ background: 'var(--card)', borderRadius: 12, padding: 30, boxShadow: 'var(--shadow-sm)', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, var(--dblu), var(--mid))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    <i className="ti ti-robot" />
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--dgray)' }}>AAIA Parts Assistant</div>
                    <div style={{ fontSize: 12, color: 'var(--gray)' }}>Vehicle: {vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}</div>
                  </div>
                </div>
                
                <p style={{ fontSize: 14, color: '#444', lineHeight: 1.5, marginBottom: 20 }}>{aiPrompt}</p>
                
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                  {suggestions.map((sug, idx) => (
                    <button key={idx} className="btn-outline" style={{ fontSize: 12, padding: '6px 12px', borderRadius: 20 }} onClick={() => handlePartSearch(sug)}>
                      {sug}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Or type the exact part you need..." 
                    value={partSearch} 
                    onChange={e => setPartSearch(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handlePartSearch(partSearch)}
                  />
                  <button className="btn-primary" onClick={() => handlePartSearch(partSearch)} disabled={loading}>
                    {loading && step === 2 ? <span className="loading-dot" /> : <i className="ti ti-arrow-right" />}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Part Details */}
            {step === 3 && partDetails && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ background: 'var(--card)', borderRadius: 12, padding: 20, boxShadow: 'var(--shadow-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ margin: '0 0 4px 0', fontSize: 18, color: 'var(--dgray)' }}>{partDetails.year} {partDetails.make} {partDetails.model} {partDetails.trim}</h2>
                    <div style={{ fontSize: 13, color: 'var(--gray)' }}>{partDetails.category} {partDetails.sub_category ? `> ${partDetails.sub_category}` : ''}</div>
                  </div>
                  <div style={{ background: '#E3F2FD', color: '#1976D2', padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                    {partDetails.parts?.length || 0} Parts Found
                  </div>
                </div>
                
                {partDetails.parts && partDetails.parts.map((part, idx) => (
                  <div key={idx} style={{ background: 'var(--card)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', gap: 24, padding: 24, flexWrap: 'wrap' }}>
                      
                      {/* Image section */}
                      <div style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {part.images && part.images[0] ? (
                          <div style={{ height: 160, background: '#f5f5f5', borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
                            <img src={part.images[0]} alt={part.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ) : (
                          <div style={{ height: 160, background: '#f5f5f5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                            <i className="ti ti-photo" style={{ fontSize: 32 }} />
                          </div>
                        )}
                        {/* Thumbnail strip */}
                        <div style={{ display: 'flex', gap: 8 }}>
                          {part.images && part.images.slice(1, 5).map((img, i) => (
                            <div key={i} style={{ width: 50, height: 50, background: '#f5f5f5', borderRadius: 4, overflow: 'hidden' }}>
                              <img src={img} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Details section */}
                      <div style={{ flex: 1, minWidth: 280 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                          <div>
                            <h3 style={{ margin: '0 0 6px 0', color: 'var(--dgray)', fontSize: 18, lineHeight: 1.3 }}>{part.title}</h3>
                            <div style={{ fontSize: 13, color: 'var(--gray)' }}>Part Number: <span style={{ fontWeight: 600, color: 'var(--dgray)' }}>{part.part_number}</span></div>
                            {part.alternate_names && (
                               <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Alt: {part.alternate_names}</div>
                            )}
                          </div>
                          
                          <div style={{ textAlign: 'right', marginLeft: 16 }}>
                            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--dblu)', whiteSpace: 'nowrap' }}>{part.price}</div>
                          </div>
                        </div>

                        <div className="markdown-body" style={{ fontSize: 14, color: '#444', lineHeight: 1.6, marginBottom: 24, borderTop: '1px solid var(--bord)', paddingTop: 16 }}>
                          <ReactMarkdown>{part.description || ''}</ReactMarkdown>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <button className="btn-primary">
                            <i className="ti ti-shopping-cart" /> Add to Order
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {loading && step === 3 && (
              <div style={{ background: 'var(--card)', borderRadius: 12, padding: 40, textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
                <span className="loading-dot" style={{ width: 30, height: 30, borderWidth: 3 }} />
                <p style={{ marginTop: 16, color: 'var(--gray)', fontSize: 14 }}>AAIA is retrieving part schemas and pricing...</p>
              </div>
            )}
            
            
          </div>
        )}

      </div>
    </div>
  );
}
