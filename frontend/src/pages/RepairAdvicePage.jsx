import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Wrench, 
  DollarSign, 
  Tool, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Truck, 
  ShieldCheck, 
  ArrowRight, 
  ChevronRight, 
  Search, 
  Clock, 
  Layers,
  HelpCircle,
  Car
} from 'lucide-react';
import APIService from '../services/api';

const POPULAR_REPAIRS = [
  { id: 'brakes', title: 'Front Brake Pads & Rotors', icon: '🛑', category: 'Braking System' },
  { id: 'alternator', title: 'Alternator & Serpentine Belt', icon: '⚡', category: 'Electrical' },
  { id: 'battery', title: 'Battery Replacement & Terminal Service', icon: '🔋', category: 'Electrical' },
  { id: 'oil_transmission', title: 'Transmission Fluid & Filter Flush', icon: '🛢️', category: 'Drivetrain' },
  { id: 'spark_plugs', title: 'Spark Plugs & Ignition Coils', icon: '💥', category: 'Engine Ignition' },
  { id: 'ac_compressor', title: 'AC Compressor & Freon Recharge', icon: '❄️', category: 'Climate Control' },
  { id: 'struts', title: 'Front Suspension Struts & Links', icon: '🚗', category: 'Suspension' },
  { id: 'timing_belt', title: 'Timing Belt & Water Pump', icon: '⚙️', category: 'Engine Timing' }
];

export default function RepairAdvicePage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Prefill vehicle if passed from Car Scanner or VIN page
  const passedVehicle = location.state?.vehicle || '';

  const [vehicle, setVehicle] = useState(passedVehicle || '2022 Toyota Camry SE');
  const [selectedRepair, setSelectedRepair] = useState('Front Brake Pads & Rotors');
  const [customSymptom, setCustomSymptom] = useState('');
  const [loading, setLoading] = useState(false);
  const [estimateData, setEstimateData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Automatically run initial estimate if vehicle passed
    handleGenerateEstimate('Front Brake Pads & Rotors');
  }, []);

  const handleGenerateEstimate = async (jobToRun = selectedRepair) => {
    if (!vehicle.trim()) {
      setError('Please specify a vehicle year, make, and model.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const data = await APIService.getRepairEstimate(
        vehicle, 
        jobToRun || customSymptom || 'General Mechanical Service',
        customSymptom
      );
      setEstimateData(data);
    } catch (err) {
      console.error('Repair estimate error:', err);
      setError('Unable to calculate repair estimate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: '#F5F8FC', padding: '24px 20px 48px' }}>
      <div style={{ maxWidth: 1150, margin: '0 auto' }}>
        
        {/* ── Page Header ── */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#E6F0FA', color: '#0A2085', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
            <Sparkles size={14} /> AI Mechanical Advisory & Cost Index
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1C2B3A', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
            Repair Advice & Cost Estimator
          </h1>
          <p style={{ fontSize: 14, color: '#607D8B', margin: 0 }}>
            Get accurate itemized parts costs (OEM vs Aftermarket), labor estimates (Shop vs Remote Mobile Mechanic), and step-by-step repair guides.
          </p>
        </div>

        {/* ── Top Control Bar: Vehicle & Custom Search ── */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid #D0DCE8', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, alignItems: 'flex-end' }}>
            
            {/* Vehicle input */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1C2B3A', marginBottom: 6, textTransform: 'uppercase' }}>
                Active Vehicle
              </label>
              <div style={{ display: 'flex', alignItems: 'center', background: '#F5F8FC', border: '1px solid #D0DCE8', borderRadius: 10, padding: '0 12px' }}>
                <Car size={18} color="#607D8B" style={{ marginRight: 8 }} />
                <input 
                  type="text" 
                  value={vehicle} 
                  onChange={e => setVehicle(e.target.value)}
                  placeholder="e.g. 2021 Ford F-150 Lariat 3.5L"
                  style={{ width: '100%', padding: '12px 0', border: 'none', background: 'transparent', outline: 'none', fontSize: 14, fontWeight: 600, color: '#1C2B3A' }}
                />
              </div>
            </div>

            {/* Custom repair / symptom input */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1C2B3A', marginBottom: 6, textTransform: 'uppercase' }}>
                Or Custom Repair / Symptom
              </label>
              <div style={{ display: 'flex', alignItems: 'center', background: '#F5F8FC', border: '1px solid #D0DCE8', borderRadius: 10, padding: '0 12px' }}>
                <Search size={18} color="#607D8B" style={{ marginRight: 8 }} />
                <input 
                  type="text" 
                  value={customSymptom} 
                  onChange={e => setCustomSymptom(e.target.value)}
                  placeholder="e.g. Squeaking brakes, Overheating, P0420..."
                  style={{ width: '100%', padding: '12px 0', border: 'none', background: 'transparent', outline: 'none', fontSize: 14, color: '#1C2B3A' }}
                  onKeyDown={e => e.key === 'Enter' && handleGenerateEstimate(customSymptom)}
                />
              </div>
            </div>

            {/* Action button */}
            <button 
              onClick={() => handleGenerateEstimate(customSymptom || selectedRepair)}
              disabled={loading}
              style={{ background: '#0A2085', color: '#fff', border: 'none', padding: '13px 24px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? <span className="loading-dot" /> : <><Sparkles size={16} /> Calculate Estimate</>}
            </button>
          </div>

          {/* Quick Select Buttons */}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #F0F4F8' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#90A4AE', textTransform: 'uppercase', marginBottom: 10 }}>
              Popular Standard Repairs
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {POPULAR_REPAIRS.map(rep => (
                <button
                  key={rep.id}
                  onClick={() => {
                    setSelectedRepair(rep.title);
                    setCustomSymptom('');
                    handleGenerateEstimate(rep.title);
                  }}
                  style={{
                    background: selectedRepair === rep.title ? '#0A2085' : '#F5F8FC',
                    color: selectedRepair === rep.title ? '#fff' : '#37474F',
                    border: '1px solid',
                    borderColor: selectedRepair === rep.title ? '#0A2085' : '#E2E8F0',
                    padding: '8px 14px',
                    borderRadius: 10,
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{rep.icon}</span>
                  <span>{rep.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div style={{ background: '#FFEBEE', border: '1px solid #FFCDD2', color: '#C62828', padding: '14px 18px', borderRadius: 12, fontSize: 13, marginBottom: 20 }}>
            {error}
          </div>
        )}

        {/* ── Loading State ── */}
        {loading && (
          <div style={{ background: '#fff', borderRadius: 20, padding: 48, textAlign: 'center', border: '1px solid #D0DCE8' }}>
            <div style={{ width: 44, height: 44, border: '3px solid #E0E7FF', borderTopColor: '#0A2085', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1C2B3A', margin: '0 0 6px 0' }}>
              Synthesizing OEM Parts & Labor Data…
            </h3>
            <p style={{ fontSize: 13, color: '#607D8B', margin: 0 }}>
              Calculating verified mechanical times, regional shop rates, and OEM vs. aftermarket price variances for {vehicle}.
            </p>
          </div>
        )}

        {/* ── Results Dashboard ── */}
        {estimateData && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.3s ease-out' }}>
            
            {/* Summary Banner */}
            <div style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid #D0DCE8', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0A2085', textTransform: 'uppercase' }}>
                  {estimateData.vehicleSummary || vehicle}
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1C2B3A', margin: '2px 0 6px 0' }}>
                  {estimateData.repairTitle}
                </h2>
                <p style={{ fontSize: 13.5, color: '#607D8B', margin: 0, maxWidth: 700 }}>
                  {estimateData.summary}
                </p>
              </div>

              {/* Urgency Badge & DIY Difficulty */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ background: '#F0F5FF', border: '1px solid #D0DCE8', padding: '10px 16px', borderRadius: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#90A4AE', fontWeight: 700, textTransform: 'uppercase' }}>DIY DIFFICULTY</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#0A2085' }}>
                    {estimateData.diyDifficulty?.rating || 'Moderate'} ({estimateData.diyDifficulty?.score || 2}/5)
                  </div>
                </div>

                <button 
                  onClick={() => navigate('/garages', { 
                    state: { 
                      vehicle, 
                      service: estimateData.repairTitle,
                      estimatedCost: estimateData.totalCostEstimate?.mobileWithAftermarket || '$250 - $400'
                    } 
                  })}
                  style={{ background: '#0A2085', color: '#fff', border: 'none', padding: '14px 22px', borderRadius: 12, fontSize: 13.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(10,32,133,0.25)' }}
                >
                  <Truck size={16} /> Book Garage / Remote Van
                </button>
              </div>
            </div>

            {/* ── Total Cost Matrix Comparison ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              {/* Option 1: DIY */}
              <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #D0DCE8', position: 'relative' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#607D8B', textTransform: 'uppercase', marginBottom: 4 }}>
                  DIY AT HOME
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#1C2B3A', marginBottom: 6 }}>
                  {estimateData.totalCostEstimate?.diyPartsOnly || 'Parts Only'}
                </div>
                <div style={{ fontSize: 12, color: '#607D8B' }}>
                  Cost of parts only. Zero labor expense.
                </div>
              </div>

              {/* Option 2: Remote Mobile Mechanic (RECOMMENDED) */}
              <div style={{ background: '#F0F7FF', borderRadius: 16, padding: 20, border: '2px solid #0A2085', position: 'relative' }}>
                <div style={{ position: 'absolute', top: -10, right: 14, background: '#0A2085', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase' }}>
                  🚐 Remote Van (Convenient)
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#0A2085', textTransform: 'uppercase', marginBottom: 4 }}>
                  Remote Mobile Garage
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#0A2085', marginBottom: 6 }}>
                  {estimateData.totalCostEstimate?.mobileWithAftermarket || '$260 - $420'}
                </div>
                <div style={{ fontSize: 12, color: '#546E7A' }}>
                  Mechanic comes to your driveway. Parts + labor included.
                </div>
              </div>

              {/* Option 3: Certified Drive-in Shop */}
              <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #D0DCE8' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#607D8B', textTransform: 'uppercase', marginBottom: 4 }}>
                  Certified Drive-in Shop
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#1C2B3A', marginBottom: 6 }}>
                  {estimateData.totalCostEstimate?.shopWithOEM || '$380 - $590'}
                </div>
                <div style={{ fontSize: 12, color: '#607D8B' }}>
                  Drop off at physical facility with OEM warranty.
                </div>
              </div>
            </div>

            {/* ── Itemized Parts Breakdown & Labor Details ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
              
              {/* Parts Table */}
              <div style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid #D0DCE8' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, borderBottom: '1px solid #F0F4F8', paddingBottom: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F6E56' }}>
                    <DollarSign size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1C2B3A' }}>Required Parts & Pricing</div>
                    <div style={{ fontSize: 12, color: '#90A4AE' }}>OEM Genuine vs Premium Aftermarket</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {estimateData.partsBreakdown?.map((part, idx) => (
                    <div key={idx} style={{ background: '#F8FAFC', padding: 14, borderRadius: 12, border: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <strong style={{ fontSize: 14, color: '#1C2B3A' }}>{part.partName}</strong>
                          <div style={{ fontSize: 11, color: '#607D8B', marginTop: 2 }}>
                            OEM Part #: <span style={{ fontFamily: 'monospace' }}>{part.oemPartNumber || 'N/A'}</span>
                          </div>
                        </div>
                        <span style={{ fontSize: 11, background: '#E6F0FA', color: '#0A2085', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>
                          {part.recommendedBrand || 'Quality Tier'}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10, paddingTop: 10, borderTop: '1px dashed #E2E8F0', fontSize: 12 }}>
                        <div>
                          <span style={{ color: '#90A4AE' }}>Aftermarket: </span>
                          <strong style={{ color: '#0F6E56' }}>{part.aftermarketPrice}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#90A4AE' }}>OEM Genuine: </span>
                          <strong style={{ color: '#1C2B3A' }}>{part.oemPrice}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Labor & Hourly Rates */}
              <div style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid #D0DCE8' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, borderBottom: '1px solid #F0F4F8', paddingBottom: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: '#FFF3E0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E65100' }}>
                    <Clock size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1C2B3A' }}>Labor Hours & Benchmarks</div>
                    <div style={{ fontSize: 12, color: '#90A4AE' }}>Standard book times & hourly rates</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ background: '#F5F8FC', padding: 14, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: '#607D8B' }}>Estimated Repair Labor Time</span>
                    <strong style={{ fontSize: 16, color: '#0A2085' }}>{estimateData.laborDetails?.estimatedHours || '1.5 - 2.0 hrs'}</strong>
                  </div>

                  <div style={{ background: '#F5F8FC', padding: 14, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: '#607D8B' }}>Drive-in Shop Labor Rate</span>
                    <strong style={{ fontSize: 14, color: '#1C2B3A' }}>{estimateData.laborDetails?.shopHourlyRate || '$120 - $160/hr'}</strong>
                  </div>

                  <div style={{ background: '#F5F8FC', padding: 14, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: '#607D8B' }}>Remote Mobile Mechanic Rate</span>
                    <strong style={{ fontSize: 14, color: '#0F6E56' }}>{estimateData.laborDetails?.mobileMechanicHourlyRate || '$95 - $135/hr'}</strong>
                  </div>

                  {estimateData.requiredTools?.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#90A4AE', textTransform: 'uppercase', marginBottom: 8 }}>
                        Required Tools for this Job
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {estimateData.requiredTools.map((tool, i) => (
                          <span key={i} style={{ background: '#F0F5FF', color: '#0A2085', fontSize: 11.5, padding: '3px 8px', borderRadius: 6, fontWeight: 500 }}>
                            🔧 {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* ── Step-by-Step AI Repair Guide ── */}
            <div style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid #D0DCE8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, borderBottom: '1px solid #F0F4F8', paddingBottom: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: '#F0F5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A2085' }}>
                  <Wrench size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1C2B3A' }}>Step-by-Step Repair Guide</div>
                  <div style={{ fontSize: 12, color: '#90A4AE' }}>Factory OEM standard procedures</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {estimateData.stepByStepGuide?.map((st, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#0A2085', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                      {st.step || i + 1}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#1C2B3A', marginBottom: 2 }}>
                        {st.title}
                      </div>
                      <p style={{ fontSize: 13, color: '#546E7A', margin: 0, lineHeight: 1.5 }}>
                        {st.instruction}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {estimateData.safetyWarnings?.length > 0 && (
                <div style={{ marginTop: 24, background: '#FFF8E1', border: '1px solid #FFE082', padding: 14, borderRadius: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#F57F17', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <AlertTriangle size={15} /> CRITICAL SAFETY WARNINGS
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 20, fontSize: 12.5, color: '#5D4037' }}>
                    {estimateData.safetyWarnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
