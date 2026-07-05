import React, { useState } from 'react';
import APIService from '../services/api';

export default function PartsPage() {
  const [mode, setMode] = useState('vin'); // 'vin', 'oem', 'ymmt'
  
  // Search state
  const [vin, setVin] = useState('');
  const [oem, setOem] = useState('');
  const [year, setYear] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [parts, setParts] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    setParts([]);
    
    let query = {};
    if (mode === 'vin') query = { vin };
    else if (mode === 'oem') query = { oem };
    else if (mode === 'ymmt') query = { year, make, model };

    try {
      const results = await APIService.searchParts(mode, query);
      setParts(results || []);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch parts. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'transparent' }}>
      <div style={{ padding: '32px 40px', borderBottom: '1px solid var(--bord)', background: 'var(--card)' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px 0', color: 'var(--dgray)' }}>Parts Lookup</h1>
        <p style={{ margin: 0, color: 'var(--gray)', fontSize: 14 }}>Search for automotive parts by VIN, OEM, or YMMT.</p>
      </div>

      <div style={{ padding: 40, flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          
          {/* Search Panel */}
          <div style={{ flex: '1 1 350px', background: 'var(--card)', borderRadius: 12, padding: 24, boxShadow: 'var(--shadow-sm)', alignSelf: 'flex-start' }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 24, background: '#F5F8FC', padding: 4, borderRadius: 8 }}>
              {['vin', 'oem', 'ymmt'].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
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

            <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {mode === 'vin' && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gray)', marginBottom: 6 }}>VEHICLE IDENTIFICATION NUMBER</label>
                  <input type="text" className="input-field" placeholder="Enter 17-character VIN" value={vin} onChange={e => setVin(e.target.value)} required />
                </div>
              )}
              {mode === 'oem' && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gray)', marginBottom: 6 }}>OEM PART NUMBER</label>
                  <input type="text" className="input-field" placeholder="e.g. 12345-ABC" value={oem} onChange={e => setOem(e.target.value)} required />
                </div>
              )}
              {mode === 'ymmt' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gray)', marginBottom: 6 }}>YEAR</label>
                    <input type="text" className="input-field" placeholder="e.g. 2023" value={year} onChange={e => setYear(e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gray)', marginBottom: 6 }}>MAKE</label>
                    <input type="text" className="input-field" placeholder="e.g. Toyota" value={make} onChange={e => setMake(e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gray)', marginBottom: 6 }}>MODEL</label>
                    <input type="text" className="input-field" placeholder="e.g. Camry" value={model} onChange={e => setModel(e.target.value)} required />
                  </div>
                </>
              )}

              <button type="submit" className="btn-primary" style={{ marginTop: 8 }} disabled={loading}>
                {loading ? <span className="loading-dot" /> : 'Search Parts'}
              </button>
            </form>
          </div>

          {/* Results Panel */}
          <div style={{ flex: '2 1 500px' }}>
            {searched && !loading && parts.length === 0 && (
              <div style={{ background: 'var(--card)', borderRadius: 12, padding: 40, textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
                <i className="ti ti-search" style={{ fontSize: 32, color: 'var(--gray)', marginBottom: 16 }} />
                <h3 style={{ margin: '0 0 8px 0', color: 'var(--dgray)' }}>No Parts Found</h3>
                <p style={{ margin: 0, color: 'var(--gray)', fontSize: 14 }}>We couldn't find any parts matching your search criteria.</p>
              </div>
            )}
            
            {loading && (
              <div style={{ background: 'var(--card)', borderRadius: 12, padding: 40, textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
                <span className="loading-dot" style={{ width: 30, height: 30, borderWidth: 3 }} />
                <p style={{ marginTop: 16, color: 'var(--gray)', fontSize: 14 }}>Searching databases...</p>
              </div>
            )}

            {!loading && parts.length > 0 && (
              <div style={{ display: 'grid', gap: 16 }}>
                {parts.map(part => (
                  <div key={part.id} style={{ background: 'var(--card)', borderRadius: 12, padding: 20, boxShadow: 'var(--shadow-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'inline-block', padding: '2px 8px', background: '#E3F2FD', color: '#1976D2', fontSize: 10, fontWeight: 700, borderRadius: 4, marginBottom: 8, letterSpacing: 0.5 }}>
                        {part.category.toUpperCase()}
                      </div>
                      <h3 style={{ margin: '0 0 4px 0', color: 'var(--dgray)', fontSize: 16 }}>{part.name}</h3>
                      <div style={{ fontSize: 12, color: 'var(--gray)', marginBottom: 8 }}>OEM: <span style={{ fontWeight: 600, color: 'var(--dgray)' }}>{part.oem}</span></div>
                      <p style={{ margin: 0, fontSize: 13, color: '#666', maxWidth: 400 }}>{part.description}</p>
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
                      <div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--dgray)' }}>${part.price.toFixed(2)}</div>
                        <div style={{ fontSize: 11, color: part.stock > 0 ? '#4CAF50' : '#F44336', fontWeight: 600 }}>
                          {part.stock > 0 ? `${part.stock} IN STOCK` : 'OUT OF STOCK'}
                        </div>
                      </div>
                      <button className="btn-outline" style={{ padding: '6px 16px', fontSize: 12 }} disabled={part.stock === 0}>
                        <i className="ti ti-shopping-cart" /> Add to Order
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
