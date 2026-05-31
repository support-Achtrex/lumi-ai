import { useState, useEffect } from 'react';
import APIService from '../services/api';

export default function UsagePage() {
  const [data, setData] = useState({ totals: { total_requests: 0, total_tokens: 0 }, daily: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const res = await APIService.getUsage();
      setData(res || { totals: { total_requests: 0, total_tokens: 0 }, daily: [] });
    } catch (e) {
      console.error('Failed to fetch usage', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: 40, color: '#888' }}>Loading usage data...</div>;

  const currentMonthName = new Date().toLocaleString('default', { month: 'long' });

  // Calculate max values for chart scaling
  const maxTokens = Math.max(...data.daily.map(d => parseInt(d.daily_tokens)), 1);
  const maxRequests = Math.max(...data.daily.map(d => parseInt(d.daily_requests)), 1);

  return (
    <div style={{ padding: '40px 48px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '32px' }}>Usage</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        
        {/* TOKENS CARD */}
        <div style={{ background: '#FFF', border: '1px solid #EBEBEB', borderRadius: '16px', padding: '32px' }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#555' }}>Total Tokens ({currentMonthName})</h2>
          <div style={{ fontSize: '40px', fontWeight: '700' }}>{parseInt(data.totals.total_tokens).toLocaleString()}</div>
          <div style={{ marginTop: '24px', height: '100px', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
            {data.daily.length === 0 ? (
              <div style={{ color: '#888', fontSize: 13 }}>No usage this month.</div>
            ) : (
              data.daily.map((d, i) => {
                const heightPct = (parseInt(d.daily_tokens) / maxTokens) * 100;
                return (
                  <div key={i} title={`${d.day}: ${d.daily_tokens} tokens`} style={{ flex: 1, background: '#0A2540', height: `${Math.max(heightPct, 2)}%`, borderRadius: '4px 4px 0 0', opacity: heightPct > 0 ? 1 : 0.2 }} />
                );
              })
            )}
          </div>
        </div>

        {/* REQUESTS CARD */}
        <div style={{ background: '#FFF', border: '1px solid #EBEBEB', borderRadius: '16px', padding: '32px' }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#555' }}>API Requests ({currentMonthName})</h2>
          <div style={{ fontSize: '40px', fontWeight: '700' }}>{parseInt(data.totals.total_requests).toLocaleString()}</div>
          <div style={{ marginTop: '24px', height: '100px', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
            {data.daily.length === 0 ? (
              <div style={{ color: '#888', fontSize: 13 }}>No usage this month.</div>
            ) : (
              data.daily.map((d, i) => {
                const heightPct = (parseInt(d.daily_requests) / maxRequests) * 100;
                return (
                  <div key={i} title={`${d.day}: ${d.daily_requests} requests`} style={{ flex: 1, background: '#0F6E56', height: `${Math.max(heightPct, 2)}%`, borderRadius: '4px 4px 0 0', opacity: heightPct > 0 ? 1 : 0.2 }} />
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
