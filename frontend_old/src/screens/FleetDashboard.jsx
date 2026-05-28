import { useState } from 'react';
import { Activity, Play, X, Wrench, AlertTriangle, Clock } from 'lucide-react';
import axios from 'axios';

export default function FleetDashboard() {
  const [analyzing, setAnalyzing] = useState(null);
  const fleet = [
    { id: 'FL-101', vin: '1HGCM82633A00435', make: 'Honda', model: 'Accord', status: 'Active' },
    { id: 'FL-102', vin: 'JTDKN3DP1E00234', make: 'Toyota', model: 'Prius', status: 'Maintenance' },
    { id: 'FL-103', vin: '1FMCU0EZ7EK5689', make: 'Ford', model: 'Escape', status: 'Active' },
  ];

  const [analysisResult, setAnalysisResult] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleAnalysis = async (id) => {
    setAnalyzing(id);
    const vehicle = fleet.find(v => v.id === id);

    try {
      const token = localStorage.getItem('token') || 'mock_token';
      const response = await axios.post(
        '/api/diagnostics/reasoning',
        {
          vin: vehicle.vin,
          symptoms: 'Routine fleet diagnostics and predictive maintenance check.'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setAnalysisResult(response.data.data.nodes);
    } catch (error) {
      console.warn("Backend error, falling back to mock nodes", error);
      // Fallback mockup for UI demonstration if backend DB is down
      setAnalysisResult([
        {
          id: "node-1",
          type: "diagnostic_step",
          title: "Check High-Voltage Battery Health",
          description: "Perform deep cycle analysis on battery cells 14-22 due to voltage delta detected in last telemetry ping.",
          requiredTools: ["OBD2 Scanner", "Multimeter"],
          requiredParts: [],
          safetyWarnings: ["Ensure vehicle is powered down and high-voltage disconnect is removed before physical inspection."],
          estimatedTime: "45 minutes",
          nextNodeIds: ["node-2"]
        },
        {
          id: "node-2",
          type: "repair_action",
          title: "Replace Cabin Air Filter",
          description: "Filter efficiency dropped below 40%. Scheduled replacement.",
          requiredTools: [],
          requiredParts: [{ name: "HEPA Cabin Filter", partNumber: "OEM-80292", estimatedCost: "$35.00" }],
          safetyWarnings: [],
          estimatedTime: "15 minutes",
          nextNodeIds: []
        }
      ]);
    } finally {
      setAnalyzing(null);
      setShowModal(true);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '2rem' }}>Fleet Dashboard</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="glass-panel" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Activity color="#10b981" size={20} />
            <span style={{ fontWeight: 'bold' }}>98%</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Fleet Health</span>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(15, 23, 42, 0.4)' }}>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>ID</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>VIN</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>Vehicle</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>Status</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {fleet.map((vehicle) => (
              <tr key={vehicle.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1.25rem 1.5rem', fontWeight: 'bold' }}>{vehicle.id}</td>
                <td style={{ padding: '1.25rem 1.5rem', fontFamily: 'monospace' }}>{vehicle.vin}</td>
                <td style={{ padding: '1.25rem 1.5rem' }}>{vehicle.make} {vehicle.model}</td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '20px', 
                    fontSize: '0.85rem',
                    background: vehicle.status === 'Active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    color: vehicle.status === 'Active' ? '#34d399' : '#fbbf24'
                  }}>
                    {vehicle.status}
                  </span>
                </td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <button 
                    className="btn-primary" 
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: analyzing === vehicle.id ? 'var(--bg-panel-hover)' : 'var(--accent)' }}
                    onClick={() => handleAnalysis(vehicle.id)}
                    disabled={analyzing === vehicle.id}
                  >
                    <Play size={14} />
                    {analyzing === vehicle.id ? 'Running...' : 'Run Analysis'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Analysis Modal */}
      {showModal && analysisResult && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div className="glass-panel animate-fade-in" style={{
            width: '90%', maxWidth: '800px', maxHeight: '85vh', overflowY: 'auto',
            background: 'var(--bg-dark)', padding: '2rem', border: '1px solid var(--border-color)',
            color: 'white', position: 'relative'
          }}>
            <div style={{ position: 'sticky', top: '-2rem', background: 'var(--bg-dark)', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', paddingTop: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'white' }}>LUMI Diagnostic Reasoning</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {analysisResult.map((node, idx) => (
                <div key={node.id} style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid var(--accent)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, color: 'white', fontSize: '1.25rem' }}>Step {idx + 1}: {node.title}</h3>
                    <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent)', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>
                      {node.type.replace('_', ' ')}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 1rem 0' }}>{node.description}</p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {/* Time & Safety */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                        <Clock size={16} color="var(--text-muted)" /> <span>Time: {node.estimatedTime}</span>
                      </div>
                      {node.safetyWarnings?.map((warn, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem', color: '#ef4444' }}>
                          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} /> <span>{warn}</span>
                        </div>
                      ))}
                    </div>

                    {/* Parts & Tools */}
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                        <Wrench size={16} color="var(--accent)" /> Required
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {node.requiredTools?.length > 0 && <div>Tools: {node.requiredTools.join(', ')}</div>}
                        {node.requiredParts?.length > 0 && (
                          <div style={{ marginTop: '0.5rem' }}>
                            Parts: {node.requiredParts.map(p => `${p.name} (${p.estimatedCost})`).join(', ')}
                          </div>
                        )}
                        {!node.requiredTools?.length && !node.requiredParts?.length && "No special tools or parts required."}
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
  );
}
