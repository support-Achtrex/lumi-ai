// src/pages/admin/AdminGaragesPage.jsx
import React, { useState, useEffect } from 'react';
import APIService from '../../services/api';
import {
  Store,
  Truck,
  Wrench,
  CheckCircle2,
  AlertCircle,
  Search,
  Plus,
  Edit,
  Trash2,
  Check,
  Ban,
  X,
  RefreshCw,
  MapPin,
  DollarSign
} from 'lucide-react';

export default function AdminGaragesPage() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'mobile_mechanic',
    isMobileCapable: true,
    phone: '',
    email: '',
    city: '',
    address: '',
    hourlyRate: 110,
    serviceRadiusMiles: 30,
    approvalStatus: 'approved',
    servicesOffered: 'Mobile Diagnostics, Brakes, Battery, Oil Change'
  });

  useEffect(() => {
    loadPartners();
  }, []);

  async function loadPartners() {
    try {
      setLoading(true);
      setError(null);
      const data = await APIService.getAdminGarages();
      setPartners(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load garages:', err);
      setError(err.message || 'Unable to retrieve partner directory.');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleStatus(partner, newStatus) {
    try {
      await APIService.updateAdminGarage(partner.id, { approvalStatus: newStatus });
      loadPartners();
    } catch (err) {
      alert(err.message || 'Failed to update partner status.');
    }
  }

  async function handleDeletePartner(id) {
    if (!window.confirm('Are you sure you want to delete this partner shop from the AAIA network?')) return;
    try {
      await APIService.deleteAdminGarage(id);
      loadPartners();
    } catch (err) {
      alert(err.message || 'Failed to delete partner.');
    }
  }

  async function handleSubmitPartner(e) {
    e.preventDefault();
    try {
      if (editingPartner) {
        await APIService.updateAdminGarage(editingPartner.id, formData);
      } else {
        await APIService.createAdminGarage(formData);
      }
      setModalOpen(false);
      setEditingPartner(null);
      loadPartners();
    } catch (err) {
      alert(err.message || 'Failed to save partner shop.');
    }
  }

  const filtered = (partners || []).filter(p => {
    const name = (p.name || '').toLowerCase();
    const city = (p.city || '').toLowerCase();
    const q = (search || '').toLowerCase();

    const matchesSearch = !q || name.includes(q) || city.includes(q);
    const matchesType = typeFilter === 'all' || p.type === typeFilter || (typeFilter === 'mobile' && p.isMobileCapable);
    const matchesStatus = statusFilter === 'all' || (p.approvalStatus || 'approved') === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#E0F2FE', color: '#0369A1', padding: '4px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 700, marginBottom: 6 }}>
            <Store size={14} /> Service Provider Network
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.5px' }}>
            Partner Garages & Mobile Vans
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={loadPartners}
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
              setEditingPartner(null);
              setFormData({
                name: '',
                type: 'mobile_mechanic',
                isMobileCapable: true,
                phone: '',
                email: '',
                city: '',
                address: '',
                hourlyRate: 110,
                serviceRadiusMiles: 30,
                approvalStatus: 'approved',
                servicesOffered: 'Mobile Diagnostics, Brakes, Battery, Oil Change'
              });
              setModalOpen(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: '#0D9488',
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
            <span>Onboard Partner</span>
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '14px 18px', color: '#B91C1C', marginBottom: 20, fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
        <StatPill title="Total Partners" value={partners.length} icon={Store} color="#2563EB" />
        <StatPill title="Remote Mobile Vans" value={partners.filter(p => p.isMobileCapable).length} icon={Truck} color="#0D9488" />
        <StatPill title="Drive-in Centers" value={partners.filter(p => p.type === 'garage').length} icon={Wrench} color="#EA580C" />
        <StatPill title="Active / Approved" value={partners.filter(p => p.approvalStatus !== 'rejected').length} icon={CheckCircle2} color="#16A34A" />
      </div>

      {/* Filter & Search Bar */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 14,
        padding: '16px 20px',
        border: '1px solid #E2E8F0',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 14
      }}>
        <div style={{ display: 'flex', alignItems: 'center', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 9, padding: '0 12px', minWidth: 280, flex: '1 1 280px' }}>
          <Search size={16} color="#94A3B8" style={{ marginRight: 8 }} />
          <input
            type="text"
            placeholder="Search partners by name or city..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', padding: '9px 0', fontSize: 13, width: '100%', color: '#1E293B' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 8, padding: '6px 10px', fontSize: 12.5, color: '#1E293B', fontWeight: 600 }}
          >
            <option value="all">All Shop Types</option>
            <option value="mobile">Remote Mobile Vans</option>
            <option value="garage">Drive-in Centers</option>
            <option value="parts_shop">Parts Suppliers</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 8, padding: '6px 10px', fontSize: 12.5, color: '#1E293B', fontWeight: 600 }}
          >
            <option value="all">All Approval Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending Review</option>
            <option value="rejected">Suspended</option>
          </select>

          <div style={{ fontSize: 12.5, color: '#64748B', fontWeight: 600 }}>
            Total: <strong style={{ color: '#0F172A' }}>{filtered.length}</strong>
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                <th style={{ padding: '14px 20px', fontWeight: 700 }}>PARTNER NAME</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>SERVICE TYPE</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>LOCATION / RADIUS</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>LABOR RATE</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>STATUS</th>
                <th style={{ padding: '14px 20px', fontWeight: 700, textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontWeight: 700, color: '#0F172A' }}>{p.name || 'Partner'}</div>
                    <div style={{ fontSize: 11.5, color: '#64748B' }}>{p.phone || '—'} • {p.email || '—'}</div>
                  </td>

                  <td style={{ padding: '16px 16px' }}>
                    <span style={{
                      background: p.isMobileCapable ? '#EFF6FF' : '#F1F5F9',
                      color: p.isMobileCapable ? '#1D4ED8' : '#334155',
                      fontSize: 11.5,
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 6
                    }}>
                      {p.isMobileCapable ? '🚐 Remote Mobile Van' : '🏢 Drive-in Center'}
                    </span>
                  </td>

                  <td style={{ padding: '16px 16px', color: '#334155' }}>
                    <div>{p.city || 'Metro Area'}</div>
                    <div style={{ fontSize: 11, color: '#94A3B8' }}>{p.serviceRadiusMiles ? `Radius: ${p.serviceRadiusMiles} miles` : 'Standard coverage'}</div>
                  </td>

                  <td style={{ padding: '16px 16px', fontWeight: 700, color: '#0D9488' }}>
                    ${p.hourlyRate ?? 110}/hr
                  </td>

                  <td style={{ padding: '16px 16px' }}>
                    <span style={{
                      background: p.approvalStatus === 'approved' ? '#F0FDF4' : p.approvalStatus === 'pending' ? '#FFFBEB' : '#FEF2F2',
                      color: p.approvalStatus === 'approved' ? '#15803D' : p.approvalStatus === 'pending' ? '#B45309' : '#B91C1C',
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 6,
                      textTransform: 'capitalize'
                    }}>
                      ● {p.approvalStatus || 'approved'}
                    </span>
                  </td>

                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      {p.approvalStatus !== 'approved' && (
                        <button
                          onClick={() => handleToggleStatus(p, 'approved')}
                          title="Approve Shop"
                          style={{ background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0', padding: '6px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <Check size={13} /> Approve
                        </button>
                      )}

                      {p.approvalStatus === 'approved' && (
                        <button
                          onClick={() => handleToggleStatus(p, 'rejected')}
                          title="Suspend Shop"
                          style={{ background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA', padding: '6px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <Ban size={13} /> Suspend
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setEditingPartner(p);
                          setFormData({
                            name: p.name || '',
                            type: p.type || 'mobile_mechanic',
                            isMobileCapable: Boolean(p.isMobileCapable),
                            phone: p.phone || '',
                            email: p.email || '',
                            city: p.city || '',
                            address: p.address || '',
                            hourlyRate: p.hourlyRate || 110,
                            serviceRadiusMiles: p.serviceRadiusMiles || 30,
                            approvalStatus: p.approvalStatus || 'approved',
                            servicesOffered: Array.isArray(p.servicesOffered) ? p.servicesOffered.join(', ') : (p.servicesOffered || '')
                          });
                          setModalOpen(true);
                        }}
                        title="Edit Shop"
                        style={{ background: '#F8FAFC', color: '#2563EB', border: '1px solid #CBD5E1', padding: '6px 8px', borderRadius: 6, cursor: 'pointer' }}
                      >
                        <Edit size={14} />
                      </button>

                      <button
                        onClick={() => handleDeletePartner(p.id)}
                        title="Delete Shop"
                        style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', padding: '6px 8px', borderRadius: 6, cursor: 'pointer' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>
                    {loading ? 'Loading partner shops…' : 'No partners found matching criteria.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Partner Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#FFFFFF', borderRadius: 20, width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto', padding: 28, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                {editingPartner ? 'Edit Partner Shop' : 'Onboard Partner Shop'}
              </h2>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitPartner} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>SHOP / MECHANIC NAME</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>PHONE NUMBER</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>EMAIL</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>CITY / REGION</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>HOURLY RATE ($)</label>
                  <input
                    type="number"
                    value={formData.hourlyRate}
                    onChange={e => setFormData({ ...formData, hourlyRate: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                    required
                  />
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, fontWeight: 700, color: '#1D4ED8', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.isMobileCapable}
                    onChange={e => setFormData({ ...formData, isMobileCapable: e.target.checked, type: e.target.checked ? 'mobile_mechanic' : 'garage' })}
                  />
                  🚐 Mobile Van Dispatch Capable (Provides Driveway / Fleet Visit Service)
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>SERVICE RADIUS (MILES)</label>
                  <input
                    type="number"
                    value={formData.serviceRadiusMiles}
                    onChange={e => setFormData({ ...formData, serviceRadiusMiles: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>APPROVAL STATUS</label>
                  <select
                    value={formData.approvalStatus}
                    onChange={e => setFormData({ ...formData, approvalStatus: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                  >
                    <option value="approved">Approved & Active</option>
                    <option value="pending">Pending Review</option>
                    <option value="rejected">Suspended / Rejected</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>SERVICES OFFERED (COMMA-SEPARATED)</label>
                <input
                  type="text"
                  value={formData.servicesOffered}
                  onChange={e => setFormData({ ...formData, servicesOffered: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                />
              </div>

              <button
                type="submit"
                style={{
                  background: '#0D9488',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '11px',
                  borderRadius: 8,
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginTop: 8
                }}
              >
                Save Partner
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatPill({ title, value, icon: Icon, color }) {
  return (
    <div style={{ background: '#FFFFFF', borderRadius: 12, padding: '14px 18px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}15`, color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={19} />
      </div>
      <div>
        <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>{title}</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A' }}>{value}</div>
      </div>
    </div>
  );
}
