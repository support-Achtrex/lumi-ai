// src/pages/admin/AdminBookingsPage.jsx
import React, { useState, useEffect } from 'react';
import APIService from '../../services/api';
import {
  CalendarCheck2,
  Truck,
  Car,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Search,
  Trash2,
  RefreshCw,
  Phone,
  User,
  DollarSign
} from 'lucide-react';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      setLoading(true);
      setError(null);
      const data = await APIService.getAdminBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load bookings:', err);
      setError(err.message || 'Unable to retrieve service bookings.');
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id, newStatus) {
    try {
      await APIService.updateAdminBooking(id, { status: newStatus });
      loadBookings();
    } catch (err) {
      alert(err.message || 'Failed to update booking status.');
    }
  }

  async function handleDeleteBooking(id) {
    if (!window.confirm('Delete this appointment record from the dispatch queue?')) return;
    try {
      await APIService.deleteAdminBooking(id);
      loadBookings();
    } catch (err) {
      alert(err.message || 'Failed to delete booking.');
    }
  }

  const filtered = (bookings || []).filter(b => {
    const sType = (b.serviceType || '').toLowerCase();
    const cName = (b.contactName || '').toLowerCase();
    const addr = (b.serviceAddress || '').toLowerCase();
    const q = (search || '').toLowerCase();

    const matchesSearch = !q || sType.includes(q) || cName.includes(q) || addr.includes(q);
    const matchesStatus = statusFilter === 'all' || (b.status || 'pending') === statusFilter;
    const matchesMode = modeFilter === 'all' || (b.bookingMode || 'garage') === modeFilter;

    return matchesSearch && matchesStatus && matchesMode;
  });

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#E0F2FE', color: '#0369A1', padding: '4px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 700, marginBottom: 6 }}>
            <CalendarCheck2 size={14} /> Dispatch & Appointments
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.5px' }}>
            Service Bookings Console
          </h1>
        </div>

        <button
          onClick={loadBookings}
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
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '14px 18px', color: '#B91C1C', marginBottom: 20, fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
        <StatPill title="Total Bookings" value={bookings.length} icon={CalendarCheck2} color="#2563EB" />
        <StatPill title="Confirmed" value={bookings.filter(b => b.status === 'confirmed').length} icon={CheckCircle2} color="#16A34A" />
        <StatPill title="Mobile Dispatches" value={bookings.filter(b => b.bookingMode === 'remote_mobile').length} icon={Truck} color="#0D9488" />
        <StatPill title="Pending Action" value={bookings.filter(b => b.status === 'pending').length} icon={AlertCircle} color="#EA580C" />
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
            placeholder="Search bookings by customer, service or address..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', padding: '9px 0', fontSize: 13, width: '100%', color: '#1E293B' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 8, padding: '6px 10px', fontSize: 12.5, color: '#1E293B', fontWeight: 600 }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={modeFilter}
            onChange={e => setModeFilter(e.target.value)}
            style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 8, padding: '6px 10px', fontSize: 12.5, color: '#1E293B', fontWeight: 600 }}
          >
            <option value="all">All Service Modes</option>
            <option value="remote_mobile">Remote Mobile Van</option>
            <option value="garage">Drive-in Center</option>
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
                <th style={{ padding: '14px 20px', fontWeight: 700 }}>BOOKING & SERVICE</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>CUSTOMER / CONTACT</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>DISPATCH LOCATION</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>SCHEDULED DATE</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>EST. COST</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>STATUS</th>
                <th style={{ padding: '14px 20px', fontWeight: 700, textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontWeight: 700, color: '#0F172A' }}>{b.serviceType || 'Automotive Service'}</div>
                    <div style={{ fontSize: 11.5, color: '#2563EB', fontWeight: 600 }}>
                      {b.bookingMode === 'remote_mobile' ? '🚐 Remote Mobile Van' : '🏢 Drive-in Facility'} • #{b.id}
                    </div>
                    {b.vehicleDetails && (
                      <div style={{ fontSize: 11, color: '#64748B' }}>
                        Vehicle: {b.vehicleDetails.year || ''} {b.vehicleDetails.make || ''} {b.vehicleDetails.model || ''}
                      </div>
                    )}
                  </td>

                  <td style={{ padding: '16px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#1E293B' }}>{b.contactName || 'Customer'}</div>
                    <div style={{ fontSize: 11.5, color: '#64748B' }}>{b.contactPhone || b.garagePhone || '—'}</div>
                  </td>

                  <td style={{ padding: '16px 16px', color: '#334155' }}>
                    <div style={{ maxWidth: 220, fontSize: 12.5 }}>{b.serviceAddress || 'Local Hub'}</div>
                  </td>

                  <td style={{ padding: '16px 16px', color: '#334155' }}>
                    <div>{b.scheduledDate || '—'}</div>
                    <div style={{ fontSize: 11, color: '#94A3B8' }}>{b.scheduledTime || ''}</div>
                  </td>

                  <td style={{ padding: '16px 16px', fontWeight: 700, color: '#0D9488' }}>
                    {b.estimatedCost || 'TBD'}
                  </td>

                  <td style={{ padding: '16px 16px' }}>
                    <select
                      value={b.status || 'pending'}
                      onChange={e => handleStatusChange(b.id, e.target.value)}
                      style={{
                        background: (b.status === 'confirmed' || b.status === 'completed') ? '#F0FDF4' : b.status === 'in_progress' ? '#EFF6FF' : '#FFFBEB',
                        color: (b.status === 'confirmed' || b.status === 'completed') ? '#15803D' : b.status === 'in_progress' ? '#1D4ED8' : '#B45309',
                        border: '1px solid #CBD5E1',
                        borderRadius: 7,
                        padding: '4px 8px',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>

                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleDeleteBooking(b.id)}
                      title="Remove Booking"
                      style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', padding: '6px 8px', borderRadius: 6, cursor: 'pointer' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>
                    {loading ? 'Loading service bookings…' : 'No service bookings found matching criteria.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
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
