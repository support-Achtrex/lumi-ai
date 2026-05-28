import { useState } from 'react';
import { Search, Info, ShieldCheck, Wrench } from 'lucide-react';

export default function VINLookup() {
  const [vin, setVin] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API lookup
    setTimeout(() => {
      setReport({
        vin: vin || '1HGCM82633A00435',
        make: 'Honda',
        model: 'Accord EX-L',
        year: 2023,
        engine: '2.0L Turbo',
        history: 'Clean Title, 1 Owner',
        price: '$28,450'
      });
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem' }}>VIN Lookup</h1>
      
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem' }}>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Enter 17-digit Vehicle Identification Number..." 
            value={vin}
            onChange={(e) => setVin(e.target.value)}
            style={{ fontSize: '1.1rem', padding: '1rem 1.25rem' }}
          />
          <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 2rem' }}>
            <Search size={20} />
            {loading ? 'Searching...' : 'Lookup'}
          </button>
        </form>
      </div>

      {report && (
        <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '2rem', color: 'var(--accent)' }}>{report.year} {report.make} {report.model}</h2>
              <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0', fontFamily: 'monospace', fontSize: '1.1rem' }}>{report.vin}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{report.price}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Market Value Est.</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            <div style={{ background: 'var(--bg-panel-hover)', padding: '1.5rem', borderRadius: '12px' }}>
              <Info size={24} color="var(--accent)" style={{ marginBottom: '1rem' }} />
              <h4 style={{ margin: '0 0 0.5rem', color: 'var(--text-muted)' }}>Specifications</h4>
              <p style={{ margin: 0, fontWeight: 500 }}>{report.engine}</p>
            </div>
            <div style={{ background: 'var(--bg-panel-hover)', padding: '1.5rem', borderRadius: '12px' }}>
              <ShieldCheck size={24} color="#10b981" style={{ marginBottom: '1rem' }} />
              <h4 style={{ margin: '0 0 0.5rem', color: 'var(--text-muted)' }}>History</h4>
              <p style={{ margin: 0, fontWeight: 500 }}>{report.history}</p>
            </div>
            <div style={{ background: 'var(--bg-panel-hover)', padding: '1.5rem', borderRadius: '12px' }}>
              <Wrench size={24} color="#f59e0b" style={{ marginBottom: '1rem' }} />
              <h4 style={{ margin: '0 0 0.5rem', color: 'var(--text-muted)' }}>Active Recalls</h4>
              <p style={{ margin: 0, fontWeight: 500 }}>0 Open Recalls</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
