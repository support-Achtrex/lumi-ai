// src/pages/admin/AdminPlansPage.jsx
import React, { useState, useEffect } from 'react';
import APIService from '../../services/api';
import {
  CreditCard,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  RefreshCw,
  AlertCircle,
  Zap,
  CheckCircle2
} from 'lucide-react';

export default function AdminPlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price_usd: 29,
    credits: 100,
    interval: 'monthly',
    tab: 'developer',
    is_popular: false,
    is_active: true,
    featuresText: ''
  });

  useEffect(() => {
    loadPlans();
  }, []);

  async function loadPlans() {
    try {
      setLoading(true);
      setError(null);
      const data = await APIService.getAdminPlans();
      setPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load plans:', err);
      setError(err.message || 'Unable to retrieve pricing plans.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitPlan(e) {
    e.preventDefault();
    try {
      const features = formData.featuresText
        ? formData.featuresText.split('\n').map(s => s.trim()).filter(Boolean)
        : [];

      const payload = {
        title: formData.title,
        description: formData.description,
        price_usd: parseFloat(formData.price_usd),
        credits: parseInt(formData.credits, 10),
        interval: formData.interval,
        tab: formData.tab,
        is_popular: Boolean(formData.is_popular),
        is_active: Boolean(formData.is_active),
        features
      };

      if (editingPlan) {
        await APIService.updateAdminPlan(editingPlan.id, payload);
      } else {
        await APIService.createAdminPlan(payload);
      }
      setModalOpen(false);
      setEditingPlan(null);
      loadPlans();
    } catch (err) {
      alert(err.message || 'Failed to save pricing plan.');
    }
  }

  async function handleDeletePlan(id) {
    if (!window.confirm('Are you sure you want to delete this pricing tier?')) return;
    try {
      await APIService.deleteAdminPlan(id);
      loadPlans();
    } catch (err) {
      alert(err.message || 'Failed to delete plan.');
    }
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#E0F2FE', color: '#0369A1', padding: '4px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 700, marginBottom: 6 }}>
            <CreditCard size={14} /> Subscription & Monetization
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.5px' }}>
            Pricing Plans & Tiers
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={loadPlans}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: '#FFFFFF',
              color: '#334155',
              border: '1px solid #CBD5E1',
              borderRadius: 8,
              padding: '9px 14px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} className={loading ? 'spin-icon' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => {
              setEditingPlan(null);
              setFormData({
                title: '',
                description: '',
                price_usd: 29,
                credits: 100,
                interval: 'monthly',
                tab: 'developer',
                is_popular: false,
                is_active: true,
                featuresText: 'High speed vehicle analysis\nAI diagnostics & cost estimator\nAPI key access'
              });
              setModalOpen(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 8,
              padding: '9px 16px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Plus size={16} />
            <span>Create Plan</span>
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '14px 18px', color: '#B91C1C', marginBottom: 20, fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Grid of Plans */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        {plans.map(p => {
          let features = [];
          if (Array.isArray(p.features)) features = p.features;
          else if (typeof p.features === 'string') {
            try { features = JSON.parse(p.features); } catch { features = [p.features]; }
          }

          return (
            <div
              key={p.id}
              style={{
                background: '#FFFFFF',
                borderRadius: 16,
                padding: 24,
                border: p.is_popular ? '2px solid #2563EB' : '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              {p.is_popular && (
                <div style={{ position: 'absolute', top: -11, right: 20, background: '#2563EB', color: '#fff', fontSize: 10.5, fontWeight: 800, padding: '2px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Popular Tier
                </div>
              )}

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      {p.title}
                    </h3>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2, textTransform: 'capitalize' }}>
                      Tab: {p.tab || 'developer'} • {p.interval || 'monthly'}
                    </div>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#2563EB' }}>
                    ${p.price_usd}
                  </div>
                </div>

                <p style={{ fontSize: 13, color: '#475569', margin: '0 0 16px 0', minHeight: 38 }}>
                  {p.description || 'Full platform access plan.'}
                </p>

                <div style={{ background: '#F8FAFC', borderRadius: 10, padding: '10px 14px', marginBottom: 16, border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Zap size={16} color="#0D9488" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0F766E' }}>
                    {p.credits} Queries / Credits included
                  </span>
                </div>

                {features.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                    {features.map((f, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#334155' }}>
                        <CheckCircle2 size={14} color="#16A34A" style={{ flexShrink: 0 }} />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8, paddingTop: 16, borderTop: '1px solid #F1F5F9' }}>
                <button
                  onClick={() => {
                    setEditingPlan(p);
                    setFormData({
                      title: p.title || '',
                      description: p.description || '',
                      price_usd: p.price_usd ?? 0,
                      credits: p.credits ?? 0,
                      interval: p.interval || 'monthly',
                      tab: p.tab || 'developer',
                      is_popular: Boolean(p.is_popular),
                      is_active: p.is_active !== false,
                      featuresText: features.join('\n')
                    });
                    setModalOpen(true);
                  }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    background: '#F8FAFC',
                    color: '#2563EB',
                    border: '1px solid #CBD5E1',
                    borderRadius: 8,
                    padding: '8px 12px',
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Edit size={14} /> Edit Plan
                </button>

                <button
                  onClick={() => handleDeletePlan(p.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#FEF2F2',
                    color: '#DC2626',
                    border: '1px solid #FECACA',
                    borderRadius: 8,
                    padding: '8px 12px',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}

        {plans.length === 0 && (
          <div style={{ gridColumn: '1 / -1', background: '#FFFFFF', padding: 40, borderRadius: 16, border: '1px solid #E2E8F0', textAlign: 'center', color: '#94A3B8' }}>
            {loading ? 'Loading pricing plans…' : 'No pricing plans currently configured.'}
          </div>
        )}
      </div>

      {/* PLAN MODAL */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#FFFFFF', borderRadius: 20, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', padding: 28, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                {editingPlan ? 'Edit Pricing Plan' : 'Create Pricing Plan'}
              </h2>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitPlan} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>PLAN TITLE</label>
                <input
                  type="text"
                  placeholder="e.g. Pro Automotive"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>DESCRIPTION</label>
                <input
                  type="text"
                  placeholder="Brief summary of plan benefits"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>PRICE (USD $)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price_usd}
                    onChange={e => setFormData({ ...formData, price_usd: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>CREDITS / QUERIES</label>
                  <input
                    type="number"
                    value={formData.credits}
                    onChange={e => setFormData({ ...formData, credits: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>BILLING INTERVAL</label>
                  <select
                    value={formData.interval}
                    onChange={e => setFormData({ ...formData, interval: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="one_time">One-Time</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>AUDIENCE TAB</label>
                  <select
                    value={formData.tab}
                    onChange={e => setFormData({ ...formData, tab: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                  >
                    <option value="developer">Developer</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="individual">Individual</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>FEATURES (ONE PER LINE)</label>
                <textarea
                  rows={4}
                  value={formData.featuresText}
                  onChange={e => setFormData({ ...formData, featuresText: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_popular}
                    onChange={e => setFormData({ ...formData, is_popular: e.target.checked })}
                  />
                  Mark as "Popular Tier"
                </label>
              </div>

              <button
                type="submit"
                style={{
                  background: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '11px',
                  borderRadius: 8,
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginTop: 6
                }}
              >
                Save Plan
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
