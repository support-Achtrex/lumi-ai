// src/pages/InspectionPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import APIService from '../services/api';

const SECTIONS = [
  {
    id: 'engine', label: 'Engine & drivetrain', icon: 'ti-engine',
    items: ['Oil level & condition','Coolant level','Belt & hoses','Air filter','Transmission fluid','Spark plugs','Exhaust']
  },
  {
    id: 'brakes', label: 'Brakes & suspension', icon: 'ti-brake',
    items: ['Front brake pads','Rear brake pads','Brake fluid','Rotors','Shocks / struts','Steering linkage']
  },
  {
    id: 'tyres', label: 'Tyres & wheels', icon: 'ti-circle',
    items: ['Front left tread','Front right tread','Rear left tread','Rear right tread','Tyre pressures','Wheel condition']
  },
  {
    id: 'electrical', label: 'Electrical & lights', icon: 'ti-bolt',
    items: ['Battery health','Headlights','Brake lights','Indicators','OBD2 fault codes','Charging system']
  },
  {
    id: 'body', label: 'Body & interior', icon: 'ti-car',
    items: ['Exterior paint','Glass / windscreen','Door seals','Seat condition','Dashboard warning lights','HVAC / climate']
  },
  {
    id: 'fluids', label: 'Fluids & filters', icon: 'ti-droplet',
    items: ['Power steering fluid','Brake fluid level','Washer fluid','Fuel filter','Cabin air filter','Differential fluid']
  },
];

const STATUS_COLORS = {
  pass:    { bg:'#EAF3DE', color:'#27500A', label:'Pass' },
  warn:    { bg:'#FAEEDA', color:'#633806', label:'Monitor' },
  fail:    { bg:'#FCEBEB', color:'#A32D2D', label:'Fail' },
  pending: { bg:'#EBF1F8', color:'#607D8B', label:'Pending' },
};

function statusBadge(s) {
  const c = STATUS_COLORS[s] || STATUS_COLORS.pending;
  return <span style={{ background:c.bg, color:c.color, borderRadius:4, padding:'2px 7px', fontSize:11, fontWeight:500 }}>{c.label}</span>;
}

export default function InspectionPage() {
  const { id }     = useParams();
  const { state }  = useLocation();
  const initVin    = state?.vin || '';

  const [vin,        setVin]        = useState(initVin);
  const [mileage,    setMileage]    = useState('');
  const [inspection, setInspection] = useState(null);
  const [items,      setItems]      = useState({});
  const [notes,      setNotes]      = useState({});
  const [analysis,   setAnalysis]   = useState('');
  const [loading,    setLoading]    = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) loadInspection(id);
    else initBlank();
  }, [id]);

  function initBlank() {
    const init = {};
    SECTIONS.forEach(s => s.items.forEach(item => { init[`${s.id}::${item}`] = 'pending'; }));
    setItems(init);
  }

  async function loadInspection(iid) {
    setLoading(true);
    try {
      const data = await APIService.getInspection(iid);
      setInspection(data);
      setVin(data.vin);
      const flat = {};
      const flatNotes = {};
      data.sections?.forEach(s => s.items?.forEach(item => {
        flat[`${s.sectionId}::${item.name}`] = item.status;
        if (item.note) flatNotes[`${s.sectionId}::${item.name}`] = item.note;
      }));
      setItems(flat);
      setNotes(flatNotes);
      setAnalysis(data.lumiAnalysis || '');
    } catch {} finally { setLoading(false); }
  }

  function setStatus(section, item, status) {
    setItems(prev => ({ ...prev, [`${section}::${item}`]: status }));
  }

  function countStatus(s) {
    return Object.values(items).filter(v => v === s).length;
  }

  function overallScore() {
    const vals = Object.values(items);
    const total = vals.length;
    if (!total) return 0;
    const score = vals.reduce((acc, v) => acc + (v==='pass'?100:v==='warn'?60:v==='fail'?0:50), 0);
    return Math.round(score / total);
  }

  async function runLumiAnalysis() {
    setAnalysis('');
    const issueList = Object.entries(items)
      .filter(([,v]) => v === 'warn' || v === 'fail')
      .map(([k,v]) => `${k.split('::')[1]}: ${v}`)
      .join(', ');
    if (!issueList) { setAnalysis('No issues detected — vehicle passed all checks.'); return; }

    const question = `This vehicle (VIN: ${vin || 'unknown'}) has these inspection findings: ${issueList}. Provide a prioritised action plan with estimated costs.`;
    let full = '';
    for await (const chunk of APIService.streamMessage(question, null, vin)) {
      if (chunk.type === 'token') { full += chunk.text; setAnalysis(full); }
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      if (!inspection) {
        const newInsp = await APIService.createInspection(vin, parseInt(mileage), null);
        for (const [key, status] of Object.entries(items)) {
          const [sectionId, item] = key.split('::');
          await APIService.updateInspectionItem(newInsp.id, sectionId, item, status, notes[key] || '');
        }
        await APIService.finaliseInspection(newInsp.id);
      }
      await runLumiAnalysis();
    } finally { setSubmitting(false); }
  }

  const score = overallScore();

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <div style={{ height:46, padding:'0 18px', borderBottom:'0.5px solid #D0DCE8', display:'flex', alignItems:'center', justifyContent:'space-between', background:'#fff', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, fontWeight:500, color:'#1C2B3A' }}>
          <i className="ti ti-clipboard-check" style={{ fontSize:15, color:'#607D8B' }} aria-hidden="true" />
          {inspection ? `Inspection #${inspection.id?.slice(0,8)}` : 'New inspection'}
        </div>
        <div style={{ display:'flex', gap:7, alignItems:'center' }}>
          {score >= 70 && <span style={{ background:'#EAF3DE', color:'#27500A', borderRadius:4, padding:'2px 8px', fontSize:12, fontWeight:500 }}>Passed</span>}
          {score > 40 && score < 70 && <span style={{ background:'#FAEEDA', color:'#633806', borderRadius:4, padding:'2px 8px', fontSize:12, fontWeight:500 }}>Advisory</span>}
          {score <= 40 && score > 0 && <span style={{ background:'#FCEBEB', color:'#A32D2D', borderRadius:4, padding:'2px 8px', fontSize:12, fontWeight:500 }}>Failed</span>}
          <button style={{ height:30, padding:'0 11px', fontSize:12 }}>
            <i className="ti ti-download" style={{ fontSize:12 }} aria-hidden="true" /> Export PDF
          </button>
        </div>
      </div>

      <div style={{ flex:1, padding:18, overflowY:'auto' }}>

        {/* VIN + mileage row */}
        {!id && (
          <div style={{ display:'flex', gap:8, marginBottom:16 }}>
            <input value={vin} onChange={e => setVin(e.target.value)} placeholder="VIN" style={{ flex:2, height:36, fontSize:12 }} />
            <input value={mileage} onChange={e => setMileage(e.target.value)} placeholder="Current mileage" type="number" style={{ flex:1, height:36, fontSize:12 }} />
          </div>
        )}

        {/* AI Visual Inspection */}
        {!id && (
          <div style={{ marginBottom:16, border:'1px dashed #00C8A8', background:'#F4F2EC', borderRadius:12, padding:24, textAlign:'center', position:'relative', overflow:'hidden' }}>
            <div style={{ width:48, height:48, background:'#00C8A8', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'#04342C', fontSize:24, margin:'0 auto 12px' }}>
              <i className="ti ti-camera" aria-hidden="true" />
            </div>
            <h3 style={{ fontSize:15, fontWeight:600, color:'#1C2B3A', margin:'0 0 6px 0' }}>AI Visual Inspection (360° Computer Vision)</h3>
            <p style={{ fontSize:12, color:'#607D8B', margin:'0 0 16px 0', maxWidth:400, marginInline:'auto' }}>
              Upload guide vehicle images or take guided photos. Our 360° computer vision detects every dent, scratch, and tire wear. Photo-based assessment in under 60 seconds.
            </p>
            <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
              <button style={{ height:36, fontSize:12, background:'#0D2FA3', color:'#fff', border:'none', padding:'0 16px', borderRadius:8, display:'flex', alignItems:'center', gap:6 }} onClick={() => {
                // Simulate AI inspection processing
                setLoading(true);
                setTimeout(() => {
                  setItems(prev => {
                    const next = {...prev};
                    Object.keys(next).forEach(k => next[k] = Math.random() > 0.8 ? 'warn' : 'pass');
                    return next;
                  });
                  setLoading(false);
                }, 1500);
              }}>
                <i className="ti ti-upload" /> Upload Photos
              </button>
              <button style={{ height:36, fontSize:12, background:'#fff', color:'#1C2B3A', border:'1px solid #D0DCE8', padding:'0 16px', borderRadius:8, display:'flex', alignItems:'center', gap:6 }}>
                <i className="ti ti-device-mobile" /> Open Camera Guide
              </button>
            </div>
          </div>
        )}

        {/* Score overview */}
        {score > 0 && (
          <div style={{ display:'flex', gap:12, marginBottom:16 }}>
            <div style={{ flex:1, border:'0.5px solid #D0DCE8', borderRadius:12, padding:16, display:'flex', alignItems:'center', gap:14 }}>
              <svg width="64" height="64" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="26" fill="none" stroke="#EBF1F8" strokeWidth="7"/>
                <circle cx="32" cy="32" r="26" fill="none" stroke={score>=70?'#00C8A8':score>=50?'#EF9F27':'#E24B4A'} strokeWidth="7"
                  strokeDasharray={`${(score/100)*163} 163`} strokeDashoffset="41" strokeLinecap="round" transform="rotate(-90 32 32)"/>
              </svg>
              <div>
                <div style={{ fontSize:28, fontWeight:500, color: score>=70?'#27500A':score>=50?'#633806':'#A32D2D' }}>{score}<span style={{ fontSize:14, color:'#607D8B' }}>/100</span></div>
                <div style={{ fontSize:11, color:'#607D8B' }}>Overall condition score</div>
                <div style={{ fontSize:11, color:'#90A4AE', marginTop:3 }}>LUMI AI grade: {score>=70?'Good condition':score>=50?'Fair condition':'Needs attention'}</div>
              </div>
            </div>
            <div style={{ flex:1, border:'0.5px solid #D0DCE8', borderRadius:12, padding:'14px 16px', display:'flex', flexDirection:'column', gap:8 }}>
              {[['Pass', countStatus('pass'), '#00C8A8'],['Monitor', countStatus('warn'), '#EF9F27'],['Fail', countStatus('fail'), '#E24B4A'],['Pending', countStatus('pending'), '#D0DCE8']].map(([l,n,c]) => (
                <div key={l} style={{ display:'flex', alignItems:'center', gap:8, fontSize:11 }}>
                  <span style={{ width:60, color:'#607D8B' }}>{l}</span>
                  <div style={{ flex:1, height:6, background:'#EBF1F8', borderRadius:3 }}><div style={{ width:`${(n/Object.values(items).length)*100}%`, height:'100%', background:c, borderRadius:3 }}/></div>
                  <span style={{ width:20, textAlign:'right', fontWeight:500, color:'#1C2B3A' }}>{n}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inspection sections */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
          {SECTIONS.map(section => (
            <div key={section.id} style={{ border:'0.5px solid #D0DCE8', borderRadius:12, overflow:'hidden' }}>
              <div style={{ padding:'9px 13px', background:'#F5F8FC', borderBottom:'0.5px solid #D0DCE8', fontSize:12, fontWeight:500, color:'#1C2B3A', display:'flex', alignItems:'center', gap:6 }}>
                <i className={`ti ${section.icon}`} style={{ fontSize:13 }} aria-hidden="true" />
                {section.label}
              </div>
              <div style={{ padding:'10px 13px', display:'flex', flexDirection:'column', gap:7 }}>
                {section.items.map(item => {
                  const key = `${section.id}::${item}`;
                  const status = items[key] || 'pending';
                  return (
                    <div key={item} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:12 }}>
                      <span style={{ color:'#607D8B', flex:1, marginRight:8 }}>{item}</span>
                      <div style={{ display:'flex', gap:3 }}>
                        {['pass','warn','fail'].map(s => (
                          <button key={s} onClick={() => setStatus(section.id, item, s)}
                            style={{ padding:'2px 7px', height:'auto', fontSize:10, fontWeight:500, border:'0.5px solid', borderRadius:4,
                              background: status===s ? STATUS_COLORS[s].bg : 'transparent',
                              color: status===s ? STATUS_COLORS[s].color : '#90A4AE',
                              borderColor: status===s ? STATUS_COLORS[s].color + '44' : '#D0DCE8'
                            }}>
                            {STATUS_COLORS[s].label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display:'flex', gap:8, marginBottom:14 }}>
          <button style={{ flex:1, height:36, fontSize:12 }} onClick={runLumiAnalysis}>
            <i className="ti ti-robot" style={{ fontSize:12 }} aria-hidden="true" /> LUMI AI analysis
          </button>
          <button className="btn-primary" style={{ flex:2, height:36, fontSize:12 }} onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Saving & analysing…' : 'Complete inspection'}
          </button>
        </div>

        {/* LUMI AI analysis */}
        {analysis && (
          <div style={{ border:'0.5px solid #9FE1CB', borderRadius:12, overflow:'hidden' }}>
            <div style={{ padding:'10px 14px', background:'#E1F5EE', borderBottom:'0.5px solid #9FE1CB', display:'flex', alignItems:'center', gap:7, fontSize:12.5, fontWeight:500, color:'#085041' }}>
              <i className="ti ti-robot" style={{ fontSize:14, color:'#0F6E56' }} aria-hidden="true" />
              LUMI AI inspection summary
            </div>
            <div style={{ padding:'13px 15px', fontSize:12.5, lineHeight:1.6, color:'#1C2B3A', whiteSpace:'pre-wrap' }}>
              {analysis}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
