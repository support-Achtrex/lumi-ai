import { useState, useEffect } from 'react';
import APIService from '../services/api';

export default function WorkflowAutomationPage() {
  const [workflows, setWorkflows] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // New Workflow State
  const [name, setName] = useState('');
  const [triggerType, setTriggerType] = useState('mileage_threshold');
  const [actionType, setActionType] = useState('send_alert');

  useEffect(() => {
    fetchWorkflows();
  }, []);

  async function fetchWorkflows() {
    try {
      const w = await APIService.getWorkflows();
      setWorkflows(w || []);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await APIService.createWorkflow({
        name,
        trigger_type: triggerType,
        trigger_config: { threshold: 50000 },
        action_type: actionType,
        action_config: { notify: 'fleet_manager' }
      });
      setShowModal(false);
      setName('');
      fetchWorkflows();
    } catch (err) {
      alert('Failed to create workflow');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    try {
      await APIService.deleteWorkflow(id);
      fetchWorkflows();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'transparent', position: 'relative' }}>
      
      {/* Top Bar */}
      <div style={{ height: 64, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--bord)', flexShrink: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, fontWeight: 600, color: 'var(--dgray)' }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, var(--teal), var(--teal-dk))', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: 'var(--shadow-md)' }}>
            <i className="ti ti-bolt" style={{ fontSize: 18 }} />
          </div>
          Workflow Automation Engine
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <i className="ti ti-plus" /> Create Workflow
        </button>
      </div>

      <div style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--dgray)', marginBottom: 8 }}>Active Rules & Automations</h1>
            <p style={{ color: 'var(--mgray)', fontSize: 15 }}>Configure AAIA to autonomously monitor your fleet telemetry and trigger actions when conditions are met.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {workflows.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', border: '2px dashed var(--lgray)', borderRadius: 12 }}>
                <i className="ti ti-automation" style={{ fontSize: 48, color: 'var(--lgray)', marginBottom: 16 }} />
                <h3 style={{ fontSize: 18, color: 'var(--dgray)', marginBottom: 8 }}>No Workflows Configured</h3>
                <p style={{ color: 'var(--mgray)', marginBottom: 24 }}>Set up your first automation rule to get started.</p>
                <button className="btn-primary" onClick={() => setShowModal(true)}>Create First Workflow</button>
              </div>
            ) : workflows.map(wf => (
              <div key={wf.id} className="glass-panel" style={{ padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  <div style={{ width: 48, height: 48, background: 'var(--offwh)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal-dk)', border: '1px solid var(--bord)' }}>
                    <i className={wf.trigger_type === 'mileage_threshold' ? 'ti ti-dashboard' : 'ti ti-alert-triangle'} style={{ fontSize: 24 }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--dgray)', marginBottom: 4 }}>{wf.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--mgray)' }}>
                      <span className="pill pill-blue">Trigger: {wf.trigger_type.replace('_', ' ')}</span>
                      <i className="ti ti-arrow-right" />
                      <span className="pill pill-teal">Action: {wf.action_type.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div className="pill pill-green" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 6, height: 6, background: 'var(--green)', borderRadius: '50%' }} /> Active</div>
                  <button onClick={() => handleDelete(wf.id)} style={{ background: 'transparent', border: 'none', color: 'var(--red)', cursor: 'pointer', padding: 8 }}>
                    <i className="ti ti-trash" style={{ fontSize: 18 }} />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="animate-slide-up" style={{ background: '#fff', width: 500, borderRadius: 16, overflow: 'hidden', boxShadow: '0 24px 48px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--lgray)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 18, fontWeight: 600 }}>Create Automation Rule</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--mgray)' }}>&times;</button>
            </div>
            
            <form onSubmit={handleCreate} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Rule Name</label>
                <input required value={name} onChange={e=>setName(e.target.value)} placeholder="e.g., 50k Mile Service Alert" style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>When this happens (Trigger)</label>
                <select value={triggerType} onChange={e=>setTriggerType(e.target.value)} style={{ width: '100%', height: 44, borderRadius: 8, border: '1px solid var(--bord)', padding: '0 16px' }}>
                  <option value="mileage_threshold">Mileage exceeds threshold</option>
                  <option value="dtc_code">Specific DTC Code detected</option>
                  <option value="sentiment_drop">Fleet sentiment drops below 70</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Do this (Action)</label>
                <select value={actionType} onChange={e=>setActionType(e.target.value)} style={{ width: '100%', height: 44, borderRadius: 8, border: '1px solid var(--bord)', padding: '0 16px' }}>
                  <option value="send_alert">Send Alert to Fleet Manager</option>
                  <option value="run_analysis">Run AAIA Diagnostics</option>
                  <option value="schedule_maintenance">Schedule Maintenance Task</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
