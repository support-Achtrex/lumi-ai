// src/pages/admin/AdminDiscountsPage.jsx
import React, { useState, useEffect } from 'react';
import APIService from '../../services/api';
import {
  Tag,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Clock,
  Calendar,
  Percent,
  DollarSign
} from 'lucide-react';

export default function AdminDiscountsPage() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage', // percentage or fixed
    discountValue: 20,
    max_uses: 100,
    expires_at: ''
  });

  useEffect(() => {
    loadDiscounts();
  }, []);

  async function loadDiscounts() {
    try {
      setLoading(true);
      setError(null);
      const data = await APIService.getAdminDiscounts();
      setDiscounts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load discounts:', err);
      setError(err.message || 'Unable to retrieve promotional codes.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateDiscount(e) {
    e.preventDefault();
    try {
      const payload = {
        code: formData.code.trim().toUpperCase(),
        percentage_off: formData.discountType === 'percentage' ? parseFloat(formData.discountValue) : null,
        fixed_amount_off: formData.discountType === 'fixed' ? parseFloat(formData.discountValue) : null,
        max_uses: formData.max_uses ? parseInt(formData.max_uses, 10) : null,
        expires_at: formData.expires_at || null
      };

      await APIService.createAdminDiscount(payload);
      setModalOpen(false);
      setFormData({
        code: '',
        discountType: 'percentage',
        discountValue: 20,
        max_uses: 100,
        expires_at: ''
      });
      loadDiscounts();
    } catch (err) {
      alert(err.message || 'Failed to create discount code.');
    }
  }

  async function handleDeleteDiscount(id) {
    if (!window.confirm('Delete this promo discount code?')) return;
    try {
      await APIService.deleteAdminDiscount(id);
      loadDiscounts();
    } catch (err) {
      alert(err.message || 'Failed to delete discount.');
    }
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#E0F2FE', color: '#0369A1', padding: '4px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 700, marginBottom: 6 }}>
            <Tag size={14} /> Marketing & Campaigns
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.5px' }}>
            Promotional & Discount Codes
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={loadDiscounts}
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
            onClick={() => setModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: '#7C3AED',
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
            <span>New Promo Code</span>
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '14px 18px', color: '#B91C1C', marginBottom: 20, fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Grid of Discounts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
        {discounts.map(d => (
          <div
            key={d.id}
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              padding: 22,
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#7C3AED', fontFamily: 'monospace', letterSpacing: '1px', background: '#F5F3FF', padding: '4px 10px', borderRadius: 8, border: '1px dashed #C4B5FD' }}>
                  {d.code}
                </span>
                <span style={{ fontSize: 11, background: '#F0FDF4', color: '#15803D', padding: '3px 8px', borderRadius: 6, fontWeight: 700 }}>
                  Active
                </span>
              </div>

              <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
                {d.percentage_off ? `${d.percentage_off}% OFF` : `$${d.fixed_amount_off} OFF`}
              </div>

              <div style={{ fontSize: 12, color: '#64748B', display: 'flex', flexDirection: 'column', gap: 4, marginTop: 10 }}>
                <div>Uses: <strong>{d.used_count ?? 0}</strong> {d.max_uses ? `/ ${d.max_uses} limit` : '(unlimited)'}</div>
                <div>Expires: <strong>{d.expires_at ? new Date(d.expires_at).toLocaleDateString() : 'Never'}</strong></div>
              </div>
            </div>

            <div style={{ paddingTop: 16, marginTop: 16, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => handleDeleteDiscount(d.id)}
                style={{
                  background: '#FEF2F2',
                  color: '#DC2626',
                  border: '1px solid #FECACA',
                  padding: '6px 12px',
                  borderRadius: 7,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </div>
        ))}

        {discounts.length === 0 && (
          <div style={{ gridColumn: '1 / -1', background: '#FFFFFF', padding: 40, borderRadius: 16, border: '1px solid #E2E8F0', textAlign: 'center', color: '#94A3B8' }}>
            {loading ? 'Loading promo codes…' : 'No active promotional discount codes.'}
          </div>
        )}
      </div>

      {/* CREATE DISCOUNT MODAL */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#FFFFFF', borderRadius: 20, width: '100%', maxWidth: 460, padding: 28, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>Create Promo Coupon</h2>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleCreateDiscount} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>COUPON CODE</label>
                <input
                  type="text"
                  placeholder="e.g. SUMMER25, AAIAVIP"
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 700 }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>DISCOUNT TYPE</label>
                  <select
                    value={formData.discountType}
                    onChange={e => setFormData({ ...formData, discountType: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                  >
                    <option value="percentage">Percentage (% off)</option>
                    <option value="fixed">Fixed Amount ($ off)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    {formData.discountType === 'percentage' ? 'PERCENT (%)' : 'AMOUNT ($)'}
                  </label>
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={e => setFormData({ ...formData, discountValue: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>MAX USES</label>
                  <input
                    type="number"
                    placeholder="e.g. 50"
                    value={formData.max_uses}
                    onChange={e => setFormData({ ...formData, max_uses: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>EXPIRATION DATE</label>
                  <input
                    type="date"
                    value={formData.expires_at}
                    onChange={e => setFormData({ ...formData, expires_at: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  background: '#7C3AED',
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
                Create Discount Code
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
