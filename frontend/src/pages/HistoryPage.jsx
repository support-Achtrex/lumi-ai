import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import APIService from '../services/api';

export default function HistoryPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [vin, setVin] = useState(state?.vin || 'WA1UAAF41M11122');
  const [vehicleContext, setVehicleContext] = useState(state?.vehicleContext || { year: 2022, make: 'Ford', model: 'F-150' });
  const [historyReport, setHistoryReport] = useState(null);
  
  const [phase, setPhase] = useState('checkout'); // 'checkout', 'processing', 'success', 'report'
  const [email, setEmail] = useState('');
  const [zip, setZip] = useState('');

  useEffect(() => {
    if (vin) {
      APIService.getVehicleHistoryReport(vin.trim().toUpperCase())
        .then(report => setHistoryReport(report))
        .catch(console.error);
    }
  }, [vin]);

  function handlePayment(e) {
    e.preventDefault();
    if (!email || !zip) return alert("Please enter email and ZIP code.");
    setPhase('processing');
    setTimeout(() => {
      setPhase('success');
    }, 2000);
  }

  function handleViewReport() {
    // Add a slight loading delay to transition smoothly to the report
    setPhase('loading-report');
    setTimeout(() => {
      setPhase('report');
    }, 1500);
  }

  function handleDownloadHTML() {
    const reportData = historyReport?.data || historyReport || {};
    if (reportData.html) {
      const blob = new Blob([reportData.html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `LUMI_History_${vin || 'Report'}.html`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      window.print();
    }
  }

  // --- REPORT RENDERER ---
  if (phase === 'report' || phase === 'loading-report') {
    if (!historyReport) {
      return (
        <div style={{ display:'flex', flexDirection:'column', height:'100%', background: '#fff' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', flexDirection:'column', gap:16 }}>
            <div className="spinner" style={{ width:40, height:40, border:'4px solid #EBF1F8', borderTopColor:'#0A2085', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
            <div style={{ fontSize:18, fontWeight:600, color:'#1C2B3A' }}>Fetching complete records...</div>
            <div style={{ fontSize:14, color:'#607D8B' }}>This may take a few moments.</div>
          </div>
        </div>
      );
    }

    const reportData = historyReport.data || historyReport || {};
    
    // Auto-detect if this is the real API or our mock
    const isRealAPI = !!reportData.detailed_vehicle_history;

    const summary = isRealAPI ? {
      accidents_reported: reportData.vehicle_summary?.data?.find(d => d.text.includes('Accident'))?.status === 'records found' ? 1 : 0,
      owners: reportData.owner_history?.data?.length || 'Unknown',
      service_records: reportData.detailed_vehicle_history?.data?.length || 0,
      title_status: reportData.checks?.data?.some(c => c.status !== 'no records found') ? 'Issues Found' : 'Clean'
    } : (reportData.summary || {
      accidents_reported: 0,
      owners: 'Unknown',
      service_records: 'Unknown',
      title_status: 'Unknown'
    });

    const ownershipHistory = isRealAPI ? (reportData.owner_history?.data || []) : (reportData.ownership_history || []);
    const serviceHistory = isRealAPI ? (reportData.detailed_vehicle_history?.data || []) : (reportData.service_history || []);
    const titleChecks = isRealAPI ? (reportData.checks?.data || []) : [];
    const usageChecks = isRealAPI ? (reportData.vehicle_usage_verification?.data || []) : [];

    return (
      <div style={{ display:'flex', flexDirection:'column', height:'100%', background: 'transparent' }}>
        <div style={{ height:64, padding:'0 24px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(255,255,255,0.7)', backdropFilter:'blur(16px)', borderBottom:'1px solid var(--bord)', flexShrink:0, zIndex:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:15, fontWeight:600, color:'var(--dgray)' }}>
            <div style={{ width:36, height:36, background:'linear-gradient(135deg, #1C2B3A, #3A506B)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', boxShadow:'var(--shadow-md)' }}>
              <i className="ti ti-file-certificate" style={{ fontSize:18 }} aria-hidden="true" />
            </div>
            Comprehensive History
          </div>
          <div style={{ display:'flex', gap:12, alignItems: 'center' }}>
            <div style={{ padding: '6px 12px', background: 'var(--teal-lt)', color: 'var(--teal-dk)', borderRadius: 8, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="ti ti-car" /> {vehicleContext.year} {vehicleContext.make} {vehicleContext.model}
            </div>
            <input value={vin} readOnly placeholder="Vehicle VIN" style={{ width: 220 }} />
          </div>
        </div>

        <div style={{ flex:1, padding: 40, overflowY:'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          {phase === 'loading-report' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 400 }}>
              <span className="loading-dot" style={{ transform: 'scale(1.5)', marginBottom: 24 }} />
              <div style={{ fontSize: 18, fontWeight: 600, color: '#607D8B' }}>Fetching complete records...</div>
            </div>
          )}

          {phase === 'report' && (
            <div className="animate-slide-up" style={{ maxWidth: 1000, width: '100%', background: '#fff', border: '1px solid #EBF1F8', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
            
            {reportData.html ? (
              <div style={{ height: 800, width: '100%' }}>
                <iframe 
                  srcDoc={reportData.html} 
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  title="Vehicle History Report"
                />
              </div>
            ) : (
              <>
                {/* Report Header */}
                <div style={{ padding: 40, background: 'linear-gradient(135deg, #1C2B3A, #0A141D)', color: '#fff', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 10 }}>
                    <button onClick={handleDownloadHTML} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <i className="ti ti-download" /> Download Report
                    </button>
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <i className="ti ti-shield-check" style={{ color: '#10B981' }} /> LUMI Verified Report
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
                    <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
                      <i className="ti ti-file-certificate" style={{ fontSize: 32, color: '#fff' }} />
                    </div>
                    <div>
                      <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 4px 0', fontFamily: 'var(--display)' }}>Comprehensive Vehicle History</h1>
                      <div style={{ fontSize: 15, color: '#90A4AE' }}>Report generated on {new Date().toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 32, background: 'rgba(255,255,255,0.05)', padding: 20, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div>
                      <div style={{ fontSize: 12, color: '#90A4AE', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Vehicle</div>
                      <div style={{ fontSize: 20, fontWeight: 700 }}>{vehicleContext.year} {vehicleContext.make} {vehicleContext.model}</div>
                    </div>
                    <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.1)' }} />
                    <div>
                      <div style={{ fontSize: 12, color: '#90A4AE', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>VIN</div>
                      <div style={{ fontSize: 18, fontFamily: 'monospace' }}>{vin}</div>
                    </div>
                  </div>
                </div>

                {/* Quick Summary Grid */}
                <div style={{ padding: '32px 40px', borderBottom: '1px solid #EBF1F8', background: '#F9FAFB' }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#607D8B', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 20px 0' }}>History Summary</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                    <div style={{ padding: 20, borderRadius: 12, background: '#fff', border: '1px solid #EBF1F8', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#1C2B3A', fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
                        <i className="ti ti-car-crash" style={{ color: summary.accidents_reported > 0 ? '#EF4444' : '#10B981', fontSize: 20 }} /> Accidents / Damage
                      </div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: summary.accidents_reported > 0 ? '#EF4444' : '#10B981' }}>
                        {summary.accidents_reported === 0 ? 'No Issues' : `${summary.accidents_reported} Reported`}
                      </div>
                    </div>
                    
                    <div style={{ padding: 20, borderRadius: 12, background: '#fff', border: '1px solid #EBF1F8', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#1C2B3A', fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
                        <i className="ti ti-users" style={{ color: '#0A2085', fontSize: 20 }} /> Previous Owners
                      </div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: '#1C2B3A' }}>
                        {summary.owners} {typeof summary.owners === 'number' && 'Owners'}
                      </div>
                    </div>

                    <div style={{ padding: 20, borderRadius: 12, background: '#fff', border: '1px solid #EBF1F8', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#1C2B3A', fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
                        <i className="ti ti-tool" style={{ color: '#0A2085', fontSize: 20 }} /> Service Records
                      </div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: '#1C2B3A' }}>
                        {summary.service_records} {typeof summary.service_records === 'number' && 'Records'}
                      </div>
                    </div>

                    <div style={{ padding: 20, borderRadius: 12, background: '#fff', border: '1px solid #EBF1F8', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#1C2B3A', fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
                        <i className="ti ti-file-text" style={{ color: summary.title_status === 'Clean' ? '#10B981' : (summary.title_status !== 'Unknown' ? '#EF4444' : '#607D8B'), fontSize: 20 }} /> Title Status
                      </div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: summary.title_status === 'Clean' ? '#10B981' : (summary.title_status !== 'Unknown' ? '#EF4444' : '#607D8B') }}>
                        {summary.title_status}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '40px' }}>
                  
                  {/* Additional Checks */}
                  <div style={{ marginBottom: 40, display: 'flex', gap: 40, flexWrap: 'wrap' }}>
                    
                    <div style={{ flex: 1, minWidth: 300 }}>
                      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1C2B3A', borderBottom: '2px solid #EBF1F8', paddingBottom: 12, marginBottom: 20 }}>Title & Damage Checks</h2>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        
                        {titleChecks.length > 0 ? titleChecks.map((check, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', background: '#fff', border: '1px solid #EBF1F8', borderRadius: 8 }}>
                            <span style={{ fontWeight: 600, color: '#455A64', textTransform: 'capitalize' }}>{check.text || check.details}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: check.status === 'no records found' ? '#10B981' : '#EF4444', fontWeight: 700 }}>
                              <i className={check.status === 'no records found' ? "ti ti-circle-check-filled" : "ti ti-alert-triangle"} /> 
                              {check.status === 'no records found' ? 'Clean' : 'Reported'}
                            </div>
                          </div>
                        )) : (
                          <div style={{ padding: 20, background: '#fff', border: '1px solid #EBF1F8', borderRadius: 8, color: '#607D8B' }}>No title checks available.</div>
                        )}
                      </div>
                    </div>

                    <div style={{ flex: 1, minWidth: 300 }}>
                      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1C2B3A', borderBottom: '2px solid #EBF1F8', paddingBottom: 12, marginBottom: 20 }}>Vehicle Usage</h2>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {usageChecks.length > 0 ? usageChecks.map((check, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', background: '#fff', border: '1px solid #EBF1F8', borderRadius: 8 }}>
                            <span style={{ fontWeight: 600, color: '#455A64' }}>{check.text}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: check.status === 'no records found' ? '#607D8B' : '#0A2085', fontWeight: 700 }}>
                              {check.status === 'no records found' ? 'No' : 'Yes'}
                            </div>
                          </div>
                        )) : (
                          <div style={{ padding: 20, background: '#fff', border: '1px solid #EBF1F8', borderRadius: 8, color: '#607D8B' }}>No usage records available.</div>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Ownership History */}
                  {ownershipHistory && ownershipHistory.length > 0 && (
                    <div style={{ marginBottom: 40 }}>
                      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1C2B3A', borderBottom: '2px solid #EBF1F8', paddingBottom: 12, marginBottom: 20 }}>Ownership History</h2>
                      <div style={{ border: '1px solid #EBF1F8', borderRadius: 12, overflow: 'hidden' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr 2fr', background: '#F5F8FC', padding: '16px 24px', fontWeight: 700, color: '#607D8B', fontSize: 13, textTransform: 'uppercase' }}>
                          <div>Owner</div>
                          <div>Year Purchased</div>
                          <div>Type of Use</div>
                          <div>Length of Ownership</div>
                        </div>
                        {ownershipHistory.map((owner, idx) => (
                          <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr 2fr', padding: '20px 24px', borderTop: idx > 0 ? '1px solid #EBF1F8' : 'none', background: '#fff', alignItems: 'center' }}>
                            <div style={{ fontSize: 18, fontWeight: 700, color: '#1C2B3A' }}>{owner.status || owner.owner}</div>
                            <div style={{ color: '#455A64', fontWeight: 600 }}>{owner.purchased || owner.year_purchased} <span style={{ color: '#90A4AE', fontWeight: 400, display: 'block', fontSize: 13 }}>{owner.state || owner.location}</span></div>
                            <div style={{ color: '#455A64', fontWeight: 600 }}>{owner.duration || owner.length_owned}</div>
                            <div style={{ color: '#455A64', fontWeight: 600 }}>{owner.owned || 'Personal'}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Detailed Service History */}
                  {serviceHistory && serviceHistory.length > 0 && (
                    <div>
                      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1C2B3A', borderBottom: '2px solid #EBF1F8', paddingBottom: 12, marginBottom: 24 }}>Detailed History</h2>
                      <div style={{ position: 'relative', paddingLeft: 20 }}>
                        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 24, width: 2, background: '#EBF1F8' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                          {serviceHistory.map((service, idx) => (
                            <div key={idx} style={{ position: 'relative', paddingLeft: 32 }}>
                              <div style={{ position: 'absolute', left: -4, top: 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', border: '3px solid #0A2085', zIndex: 1 }} />
                              
                              <div style={{ display: 'flex', gap: 24 }}>
                                <div style={{ width: 120, flexShrink: 0 }}>
                                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1C2B3A' }}>{service.date}</div>
                                  {service.odometer || service.mileage ? <div style={{ fontSize: 13, color: '#607D8B', marginTop: 4 }}>{service.odometer || service.mileage} mi</div> : null}
                                </div>
                                
                                <div style={{ flex: 1, background: '#fff', border: '1px solid #EBF1F8', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                                  <div style={{ fontSize: 16, fontWeight: 700, color: '#1C2B3A', marginBottom: 8 }}>
                                    {service.location || service.facility || 'Service Facility'} 
                                    {service.source && <span style={{ fontSize: 12, fontWeight: 400, color: '#90A4AE', marginLeft: 8 }}>({Array.isArray(service.source) ? service.source.join(', ') : service.source})</span>}
                                  </div>
                                  <div style={{ fontSize: 14, color: '#455A64', lineHeight: 1.6 }}>
                                    {Array.isArray(service.details) ? service.details.map((d, i) => <div key={i}>• {d}</div>) : (service.details || service.description)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </>
            )}

            </div>
          )}
        </div>
      </div>
    );
  }

  // --- CHECKOUT / PROCESSING / SUCCESS RENDERER ---
  return (
    <div style={{ display: 'flex', height: '100%', background: '#fff', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Left Sidebar */}
      <div style={{ width: 280, borderRight: '1px solid #e0e0e0', padding: '32px 24px', background: '#fafafa', overflowY: 'auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 80, height: 80, background: '#1C2B3A', borderRadius: '50%', margin: '0 auto 16px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
            <i className="ti ti-shield-check" style={{ fontSize: 40 }} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1C2B3A', borderBottom: '2px solid #1C2B3A', paddingBottom: 8, display: 'inline-block' }}>Each LUMI Report Checks For:</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: '#1C2B3A', marginBottom: 8 }}>
              <i className="ti ti-square-check-filled" style={{ color: '#0F6E56', fontSize: 20 }} /> Accident Data
            </div>
            <ul style={{ margin: 0, paddingLeft: 30, color: '#607D8B', fontSize: 13, lineHeight: 1.8 }}>
              <li>Accident History</li>
              <li>Damage Severity</li>
              <li>Damage Location</li>
              <li>Airbag Deployment</li>
              <li>Structural Damage</li>
            </ul>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: '#1C2B3A', marginBottom: 8 }}>
              <i className="ti ti-tool" style={{ color: '#607D8B', fontSize: 20 }} /> Service History
            </div>
            <ul style={{ margin: 0, paddingLeft: 30, color: '#607D8B', fontSize: 13, lineHeight: 1.8 }}>
              <li>Oil Changes</li>
              <li>Tire Rotations</li>
              <li>Open Recalls</li>
              <li>Brake Replacements</li>
              <li>Safety Inspections</li>
            </ul>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: '#1C2B3A', marginBottom: 8 }}>
              <i className="ti ti-home" style={{ color: '#EF4444', fontSize: 20 }} /> Type of Use
            </div>
            <ul style={{ margin: 0, paddingLeft: 30, color: '#607D8B', fontSize: 13, lineHeight: 1.8 }}>
              <li>Personal Vehicle</li>
              <li>Rental Vehicle</li>
              <li>Leased Vehicle</li>
              <li>Commercial Vehicle</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '40px 60px', overflowY: 'auto' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h1 style={{ fontSize: 32, fontWeight: 700, color: '#1C2B3A', marginBottom: 16 }}>Order LUMI History Reports</h1>
            <p style={{ fontSize: 20, color: '#1C2B3A', marginBottom: 24 }}>We found <strong>{historyReport?.summary?.service_records || 14} history records</strong> on this vehicle.</p>
            
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '12px 24px', background: '#F5F8FC', borderRadius: 8, border: '1px solid #D0DCE8' }}>
              <i className="ti ti-car" style={{ fontSize: 24, color: '#0A2085' }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1C2B3A' }}>{vehicleContext.year} {vehicleContext.make} {vehicleContext.model}</div>
                <div style={{ fontSize: 12, color: '#607D8B' }}><strong>VIN:</strong> {vin}</div>
              </div>
            </div>
          </div>

          {phase === 'checkout' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
              
              <div style={{ textAlign: 'center' }}>
                <button 
                  onClick={handleViewReport} 
                  style={{ background: 'transparent', border: '1px solid #0A2085', color: '#0A2085', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
                >
                  Skip Checkout & View Report (Dev)
                </button>
              </div>

              {/* Step 1 */}
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1C2B3A', borderBottom: '1px solid #e0e0e0', paddingBottom: 8, marginBottom: 24 }}>Step 1. Select Your Package</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  
                  <div style={{ border: '2px solid #0F6E56', borderRadius: 8, padding: 24, position: 'relative', background: '#f8fdfa', textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#f0f0f0', color: '#607D8B', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 12, border: '1px solid #d0d0d0' }}>STANDARD</div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1C2B3A', marginBottom: 12 }}>1 LUMI Report <i className="ti ti-car" /></h3>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#1C2B3A', marginBottom: 4 }}>$44.99</div>
                    <div style={{ fontSize: 12, color: '#607D8B', marginBottom: 16 }}>($44.99/Report)</div>
                    <div style={{ fontSize: 13, color: '#1C2B3A', marginBottom: 24 }}>Best for one car only.</div>
                    <input type="radio" checked readOnly style={{ width: 18, height: 18, accentColor: '#0A2085' }} />
                  </div>

                </div>
              </div>

              {/* Step 2 */}
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1C2B3A', borderBottom: '1px solid #e0e0e0', paddingBottom: 8, marginBottom: 24 }}>Step 2. Select Method of Payment</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="radio" name="payment" defaultChecked style={{ accentColor: '#0A2085' }} />
                    <span style={{ fontWeight: 600 }}>Credit/Debit Card</span>
                    <i className="ti ti-credit-card" style={{ fontSize: 24, color: '#1C2B3A' }} />
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', opacity: 0.5 }}>
                    <input type="radio" name="payment" disabled />
                    <span style={{ fontWeight: 600 }}>PayPal</span>
                    <i className="ti ti-brand-paypal" style={{ fontSize: 24, color: '#003087' }} />
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', opacity: 0.5 }}>
                    <input type="radio" name="payment" disabled />
                    <span style={{ fontWeight: 600 }}>Apple Pay</span>
                    <i className="ti ti-brand-apple" style={{ fontSize: 24, color: '#000' }} />
                  </label>
                </div>
              </div>

              {/* Step 3 */}
              <form onSubmit={handlePayment}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1C2B3A', borderBottom: '1px solid #e0e0e0', paddingBottom: 8, marginBottom: 24 }}>Step 3. Personal Details</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 400 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#1C2B3A', marginBottom: 8 }}>Email <span style={{ color: '#EF4444' }}>*</span></label>
                    <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="example@email.com" style={{ width: '100%', padding: '12px 16px', border: '1px solid #d0d0d0', borderRadius: 4, fontSize: 15 }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#1C2B3A', marginBottom: 8 }}>ZIP <span style={{ color: '#EF4444' }}>*</span></label>
                    <input type="text" required value={zip} onChange={e=>setZip(e.target.value)} placeholder="ZIP" style={{ width: 150, padding: '12px 16px', border: '1px solid #d0d0d0', borderRadius: 4, fontSize: 15 }} />
                  </div>

                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginTop: 12, cursor: 'pointer' }}>
                    <input type="checkbox" required style={{ marginTop: 4 }} />
                    <div style={{ fontSize: 13, color: '#607D8B' }}>
                      I agree to the <span style={{ color: '#0A2085', textDecoration: 'underline' }}>Customer Agreement</span> and understand that LUMI may not have the complete history of every vehicle.
                    </div>
                  </label>

                  <button type="submit" className="btn-primary" style={{ background: '#0A2085', color: '#fff', fontSize: 16, padding: '16px 24px', border: 'none', borderRadius: 4, fontWeight: 700, marginTop: 16, cursor: 'pointer' }}>
                    Continue to Payment for 1 Report
                  </button>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked />
                    <span style={{ fontSize: 12, color: '#607D8B' }}>Send me special offers and other helpful information from LUMI.</span>
                  </label>
                </div>
              </form>

            </div>
          )}

          {phase === 'processing' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0' }}>
              <span className="loading-dot" style={{ transform: 'scale(1.5)', marginBottom: 24 }} />
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1C2B3A' }}>Processing Payment...</h2>
              <p style={{ color: '#607D8B' }}>Please do not close this window.</p>
            </div>
          )}

          {phase === 'success' && (
            <div className="animate-fade-in" style={{ textAlign: 'center', padding: '40px 0', maxWidth: 500, margin: '0 auto' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#0F6E56', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, margin: '0 auto 24px auto' }}>
                <i className="ti ti-check" />
              </div>
              <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1C2B3A', marginBottom: 16 }}>Payment Successful!</h2>
              <p style={{ fontSize: 16, color: '#607D8B', marginBottom: 32, lineHeight: 1.6 }}>
                Your order for 1 LUMI History Report has been confirmed. We've sent your login credentials to <strong>{email}</strong>.
              </p>
              
              <div style={{ background: '#F5F8FC', border: '1px solid #D0DCE8', borderRadius: 8, padding: 24, marginBottom: 32, textAlign: 'left' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1C2B3A', marginBottom: 12, textTransform: 'uppercase' }}>Your Login Details</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #d0d0d0', paddingBottom: 8, marginBottom: 8 }}>
                  <span style={{ color: '#607D8B' }}>Email / Username:</span>
                  <span style={{ fontWeight: 700, color: '#1C2B3A' }}>{email}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#607D8B' }}>Temporary Password:</span>
                  <span style={{ fontWeight: 700, color: '#1C2B3A', fontFamily: 'monospace' }}>LUMI-{Math.floor(1000 + Math.random() * 9000)}</span>
                </div>
              </div>

              <button onClick={handleViewReport} className="btn-primary" style={{ background: '#0A2085', padding: '16px 32px', fontSize: 16, borderRadius: 8, width: '100%' }}>
                View Report Now
              </button>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
