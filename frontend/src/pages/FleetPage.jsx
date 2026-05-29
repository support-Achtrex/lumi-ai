// src/pages/FleetPage.jsx
import { useState, useEffect } from 'react';
import APIService from '../services/api';

const MOCK_VEHICLES = [
  { vin: '1FMCU0GX3MU******', make: 'Ford', model: 'Escape', year: 2021, mileage: 42100, risk: 'low', sentiment: 92, alert: null },
  { vin: 'WA1UAAF41M1******', make: 'Audi', model: 'Q5', year: 2022, mileage: 31050, risk: 'high', sentiment: 45, alert: 'High probability of transmission slip in next 500 mi.' },
  { vin: 'JHMZC5F31MC******', make: 'Honda', model: 'CR-V', year: 2021, mileage: 86500, risk: 'medium', sentiment: 78, alert: 'Approaching 90k major service interval.' },
  { vin: '3VW217AJ8MM******', make: 'Volkswagen', model: 'Jetta', year: 2021, mileage: 59000, risk: 'low', sentiment: 88, alert: null },
];

export default function FleetPage() {
  const [loading,  setLoading]  = useState(false);
  const [analysis, setAnalysis] = useState('');

  async function runLumiFleetAnalysis() {
    setLoading(true);
    setAnalysis('');
    setTimeout(() => {
      setAnalysis('LUMI AI has analyzed 428 telemetry data points across the fleet. Anomalies detected in Audi Q5 (WA1UAAF41M1******) transmission pressure curves. Recommend pre-emptive service scheduling to avoid 28% increase in repair cost if component fails on-road.');
      setLoading(false);
    }, 2000);
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background: 'transparent' }}>
      
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
        </div>
      </div>

      <div style={{ flex:1, padding:24, overflowY:'auto' }}>
        
        {/* Real-time Fleet Sentiment */}
        <h3 style={{ fontSize: 16, marginBottom: 16, color: 'var(--dgray)', fontFamily: 'var(--display)' }}>Real-time Fleet Sentiment</h3>
        <div className="stat-grid">
          <div className="glass-panel" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 12, color: 'var(--mgray)', textTransform: 'uppercase', fontWeight: 600 }}>Overall Sentiment Score</div>
            <div style={{ fontSize: 42, fontWeight: 700, fontFamily: 'var(--display)', color: 'var(--teal-dk)' }}>84<span style={{ fontSize: 20, color: 'var(--sgray)' }}>/100</span></div>
            <div style={{ fontSize: 13, color: 'var(--green)' }}><i className="ti ti-trending-up" /> +2.4% vs last week</div>
          </div>
          <div className="glass-panel" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 12, color: 'var(--mgray)', textTransform: 'uppercase', fontWeight: 600 }}>Predictive Alerts</div>
            <div style={{ fontSize: 42, fontWeight: 700, fontFamily: 'var(--display)', color: 'var(--red)' }}>2</div>
            <div style={{ fontSize: 13, color: 'var(--red)' }}>Critical preventative actions required</div>
          </div>
          <div className="glass-panel" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, gridColumn: 'span 2' }}>
            <div style={{ fontSize: 12, color: 'var(--mgray)', textTransform: 'uppercase', fontWeight: 600 }}>LUMI AI Analysis Stream</div>
            {analysis ? (
              <div style={{ fontSize: 14, color: 'var(--dgray)', lineHeight: 1.6, animation: 'fadeIn 0.5s' }}>
                <span className="pill pill-teal" style={{ marginRight: 8 }}>Insight</span>
                {analysis}
              </div>
            ) : (
              <div style={{ fontSize: 14, color: 'var(--sgray)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 8, height: '100%' }}>
                Click "Deep Fleet Analysis" to generate real-time predictive models.
              </div>
            )}
          </div>
        </div>

        {/* Predictive Vehicle List */}
        <h3 style={{ fontSize: 16, marginBottom: 16, marginTop: 32, color: 'var(--dgray)', fontFamily: 'var(--display)' }}>Predictive Maintenance Monitoring</h3>
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1.5fr 2fr', background:'rgba(249,250,251,0.5)', borderBottom:'1px solid var(--bord)', padding: '12px 16px', fontSize: 12, fontWeight: 600, color: 'var(--mgray)', textTransform: 'uppercase' }}>
            <div>Vehicle</div>
            <div>Mileage</div>
            <div>Sentiment</div>
            <div>Risk Level</div>
            <div>LUMI Alert</div>
          </div>
          {MOCK_VEHICLES.map(v => (
            <div key={v.vin} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1.5fr 2fr', padding: '16px', borderBottom:'1px solid var(--lgray)', alignItems: 'center', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.5)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
              <div>
                <div style={{ fontWeight:600, fontSize:14, color: 'var(--dgray)', marginBottom: 2 }}>{v.year} {v.make} {v.model}</div>
                <div style={{ fontSize:11, color:'var(--sgray)', fontFamily:'var(--mono)' }}>{v.vin}</div>
              </div>
              <div style={{ fontSize:13, color: 'var(--dgray)', fontWeight: 500 }}>{v.mileage.toLocaleString()} mi</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 32, height: 4, background: 'var(--lgray)', borderRadius: 2 }}>
                    <div style={{ width: `${v.sentiment}%`, height: '100%', background: v.sentiment > 80 ? 'var(--green)' : v.sentiment > 50 ? 'var(--amber)' : 'var(--red)', borderRadius: 2 }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--mgray)' }}>{v.sentiment}</span>
                </div>
              </div>
              <div>
                <span className={`pill ${v.risk === 'high' ? 'pill-red' : v.risk === 'medium' ? 'pill-amber' : 'pill-green'}`}>{v.risk}</span>
              </div>
              <div style={{ fontSize:13, color: v.alert ? 'var(--red)' : 'var(--mgray)', lineHeight: 1.4 }}>
                {v.alert ? (
                  <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                    <i className="ti ti-alert-triangle" style={{ marginTop: 2 }} />
                    {v.alert}
                  </div>
                ) : 'System nominal'}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
