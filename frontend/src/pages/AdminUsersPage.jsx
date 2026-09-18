import React, { useState, useEffect } from 'react';
import APIService from '../services/api';
import { 
  Users, 
  CreditCard, 
  Tag, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Shield, 
  KeyRound,
  CheckCircle2,
  Store,
  Truck,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  AlertCircle,
  Activity,
  Check,
  Ban
} from 'lucide-react';

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState('partners'); // 'partners', 'bookings', 'users', 'plans', 'discounts'

  return (
    <div style={{ padding: '32px 36px', background: '#F5F8FC', minHeight: '100%', fontFamily: "'Inter', sans-serif", overflowY: 'auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1C2B3A', margin: 0, letterSpacing: '-0.5px' }}>
            Admin Control Center
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid #D0DCE8', marginBottom: 28, overflowX: 'auto' }}>
        <TabButton active={activeTab === 'partners'} onClick={() => setActiveTab('partners')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Store size={16} /> Partner Shops & Remote Garages
          </div>
        </TabButton>
        <TabButton active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={16} /> Service Bookings & Dispatch
          </div>
        </TabButton>
        <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Users size={16} /> Users & Roles
          </div>
        </TabButton>
        <TabButton active={activeTab === 'plans'} onClick={() => setActiveTab('plans')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CreditCard size={16} /> Pricing Plans
          </div>
        </TabButton>
        <TabButton active={activeTab === 'discounts'} onClick={() => setActiveTab('discounts')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Tag size={16} /> Discounts
          </div>
        </TabButton>
      </div>

      {activeTab === 'partners' && <PartnersTab />}
      {activeTab === 'bookings' && <BookingsTab />}
      {activeTab === 'users' && <UsersTab />}
      {activeTab === 'plans' && <PlansTab />}
      {activeTab === 'discounts' && <DiscountsTab />}
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        padding: '0 0 12px 0',
        fontSize: 14.5,
        fontWeight: active ? 700 : 500,
        color: active ? '#0A2085' : '#607D8B',
        borderBottom: active ? '3px solid #0A2085' : '3px solid transparent',
        cursor: 'pointer',
        transition: 'all 0.2s',
        whiteSpace: 'nowrap'
      }}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. PARTNERS & ONBOARDING TAB (ADMIN)
// ─────────────────────────────────────────────────────────────────────────────
function PartnersTab() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
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

  useEffect(() => { loadPartners(); }, []);

  async function loadPartners() {
    try {
      setLoading(true);
      const data = await APIService.getAdminGarages();
      setPartners(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleStatus(partner, newStatus) {
    try {
      await APIService.updateAdminGarage(partner.id, { approvalStatus: newStatus });
      loadPartners();
    } catch (e) {
      alert(e.message || 'Failed to update status');
    }
  }

  async function handleDeletePartner(id) {
    if (!window.confirm('Are you sure you want to remove this partner shop?')) return;
    try {
      await APIService.deleteAdminGarage(id);
      loadPartners();
    } catch (e) {
      alert(e.message || 'Failed to delete partner');
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
    } catch (e) {
      alert(e.message || 'Failed to save partner');
    }
  }

  const filtered = partners.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Top Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard title="Total Partner Shops" value={partners.length} icon={Store} color="#0A2085" />
        <StatCard title="Remote Mobile Vans" value={partners.filter(p => p.isMobileCapable).length} icon={Truck} color="#0F6E56" />
        <StatCard title="Drive-in Centers" value={partners.filter(p => p.type === 'garage').length} icon={Wrench} color="#E65100" />
        <StatCard title="Active / Approved" value={partners.filter(p => p.approvalStatus !== 'rejected').length} icon={CheckCircle2} color="#0F6E56" />
      </div>

      {/* Action Bar */}
      <div style={{ background: '#fff', borderRadius: 16, padding: '16px 20px', border: '1px solid #D0DCE8', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', background: '#F5F8FC', border: '1px solid #D0DCE8', borderRadius: 10, padding: '0 12px', minWidth: 280 }}>
          <Search size={16} color="#90A4AE" style={{ marginRight: 6 }} />
          <input 
            type="text" 
            placeholder="Search partners by name or city..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            style={{ border: 'none', background: 'transparent', outline: 'none', padding: '10px 0', fontSize: 13, width: '100%' }}
          />
        </div>

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
          style={{ background: '#0A2085', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Plus size={16} /> Onboard New Partner
        </button>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #D0DCE8', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #D0DCE8', color: '#607D8B' }}>
              <th style={{ padding: '14px 20px', fontWeight: 700 }}>PARTNER NAME</th>
              <th style={{ padding: '14px 16px', fontWeight: 700 }}>TYPE</th>
              <th style={{ padding: '14px 16px', fontWeight: 700 }}>LOCATION / RADIUS</th>
              <th style={{ padding: '14px 16px', fontWeight: 700 }}>HOURLY RATE</th>
              <th style={{ padding: '14px 16px', fontWeight: 700 }}>APPROVAL STATUS</th>
              <th style={{ padding: '14px 20px', fontWeight: 700, textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #F0F4F8' }}>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ fontWeight: 700, color: '#1C2B3A' }}>{p.name}</div>
                  <div style={{ fontSize: 11.5, color: '#90A4AE' }}>{p.phone} • {p.email}</div>
                </td>
                <td style={{ padding: '16px 16px' }}>
                  <span style={{ background: p.isMobileCapable ? '#E6F0FA' : '#F5F8FC', color: p.isMobileCapable ? '#0A2085' : '#37474F', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>
                    {p.isMobileCapable ? '🚐 Remote Mobile Van' : '🏢 Drive-in Center'}
                  </span>
                </td>
                <td style={{ padding: '16px 16px', color: '#37474F' }}>
                  {p.city} {p.serviceRadiusMiles ? `(${p.serviceRadiusMiles} mi)` : ''}
                </td>
                <td style={{ padding: '16px 16px', fontWeight: 700, color: '#0F6E56' }}>
                  ${p.hourlyRate}/hr
                </td>
                <td style={{ padding: '16px 16px' }}>
                  <span style={{ 
                    background: p.approvalStatus === 'approved' ? '#E1F5EE' : p.approvalStatus === 'pending' ? '#FFF3E0' : '#FFEBEE',
                    color: p.approvalStatus === 'approved' ? '#0F6E56' : p.approvalStatus === 'pending' ? '#E65100' : '#C62828',
                    fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, textTransform: 'capitalize' 
                  }}>
                    ● {p.approvalStatus || 'Approved'}
                  </span>
                </td>
                <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    {p.approvalStatus !== 'approved' && (
                      <button onClick={() => handleToggleStatus(p, 'approved')} title="Approve Shop" style={{ background: '#E1F5EE', color: '#0F6E56', border: 'none', padding: '6px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Check size={14} /> Approve
                      </button>
                    )}
                    {p.approvalStatus === 'approved' && (
                      <button onClick={() => handleToggleStatus(p, 'rejected')} title="Suspend Shop" style={{ background: '#FFEBEE', color: '#C62828', border: 'none', padding: '6px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Ban size={14} /> Suspend
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        setEditingPartner(p);
                        setFormData({
                          name: p.name,
                          type: p.type,
                          isMobileCapable: p.isMobileCapable,
                          phone: p.phone,
                          email: p.email,
                          city: p.city,
                          address: p.address,
                          hourlyRate: p.hourlyRate,
                          serviceRadiusMiles: p.serviceRadiusMiles,
                          approvalStatus: p.approvalStatus || 'approved',
                          servicesOffered: Array.isArray(p.servicesOffered) ? p.servicesOffered.join(', ') : (p.servicesOffered || '')
                        });
                        setModalOpen(true);
                      }}
                      style={{ background: '#F5F8FC', color: '#0A2085', border: '1px solid #D0DCE8', padding: '6px 8px', borderRadius: 6, cursor: 'pointer' }}
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeletePartner(p.id)}
                      style={{ background: '#FFEBEE', color: '#C62828', border: 'none', padding: '6px 8px', borderRadius: 6, cursor: 'pointer' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Partner Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto', padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{editingPartner ? 'Edit Partner Shop' : 'Onboard Partner Shop'}</h2>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#90A4AE' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmitPartner} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#1C2B3A', marginBottom: 4 }}>SHOP / MECHANIC NAME</label>
                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #D0DCE8' }} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#1C2B3A', marginBottom: 4 }}>PHONE</label>
                  <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #D0DCE8' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#1C2B3A', marginBottom: 4 }}>EMAIL</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #D0DCE8' }} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#1C2B3A', marginBottom: 4 }}>CITY / METRO</label>
                  <input type="text" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #D0DCE8' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#1C2B3A', marginBottom: 4 }}>HOURLY LABOR RATE ($)</label>
                  <input type="number" value={formData.hourlyRate} onChange={e => setFormData({ ...formData, hourlyRate: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #D0DCE8' }} required />
                </div>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, color: '#0A2085', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.isMobileCapable} onChange={e => setFormData({ ...formData, isMobileCapable: e.target.checked, type: e.target.checked ? 'mobile_mechanic' : 'garage' })} />
                  🚐 Provides Remote Mobile Van Service (Dispatches to Customer Location)
                </label>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#1C2B3A', marginBottom: 4 }}>APPROVAL STATUS</label>
                <select value={formData.approvalStatus} onChange={e => setFormData({ ...formData, approvalStatus: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #D0DCE8' }}>
                  <option value="approved">Approved & Active</option>
                  <option value="pending">Pending Review</option>
                  <option value="rejected">Suspended / Rejected</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#1C2B3A', marginBottom: 4 }}>SERVICES (COMMA SEPARATED)</label>
                <input type="text" value={formData.servicesOffered} onChange={e => setFormData({ ...formData, servicesOffered: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #D0DCE8' }} />
              </div>

              <button type="submit" style={{ background: '#0A2085', color: '#fff', border: 'none', padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 10 }}>
                Save Partner
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. BOOKINGS & DISPATCH TAB (ADMIN)
// ─────────────────────────────────────────────────────────────────────────────
function BookingsTab() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadBookings(); }, []);

  async function loadBookings() {
    try {
      setLoading(true);
      const data = await APIService.getAdminBookings();
      setBookings(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id, newStatus) {
    try {
      await APIService.updateAdminBooking(id, { status: newStatus });
      loadBookings();
    } catch (e) {
      alert(e.message || 'Failed to update booking');
    }
  }

  async function handleDeleteBooking(id) {
    if (!window.confirm('Delete this service appointment record?')) return;
    try {
      await APIService.deleteAdminBooking(id);
      loadBookings();
    } catch (e) {
      alert(e.message || 'Failed to delete booking');
    }
  }

  return (
    <div>
      {/* Top Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard title="Total Appointments" value={bookings.length} icon={Calendar} color="#0A2085" />
        <StatCard title="Confirmed Bookings" value={bookings.filter(b => b.status === 'confirmed').length} icon={CheckCircle2} color="#0F6E56" />
        <StatCard title="Mobile Dispatches" value={bookings.filter(b => b.bookingMode === 'remote_mobile').length} icon={Truck} color="#0A2085" />
        <StatCard title="Pending Review" value={bookings.filter(b => b.status === 'pending').length} icon={AlertCircle} color="#E65100" />
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #D0DCE8', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #D0DCE8', color: '#607D8B' }}>
              <th style={{ padding: '14px 20px', fontWeight: 700 }}>BOOKING ID & SERVICE</th>
              <th style={{ padding: '14px 16px', fontWeight: 700 }}>CUSTOMER & CONTACT</th>
              <th style={{ padding: '14px 16px', fontWeight: 700 }}>DISPATCH LOCATION</th>
              <th style={{ padding: '14px 16px', fontWeight: 700 }}>DATE & TIME</th>
              <th style={{ padding: '14px 16px', fontWeight: 700 }}>EST. COST</th>
              <th style={{ padding: '14px 16px', fontWeight: 700 }}>STATUS</th>
              <th style={{ padding: '14px 20px', fontWeight: 700, textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.id} style={{ borderBottom: '1px solid #F0F4F8' }}>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ fontWeight: 700, color: '#1C2B3A' }}>{b.serviceType}</div>
                  <div style={{ fontSize: 11, color: '#0A2085', fontWeight: 600 }}>
                    {b.bookingMode === 'remote_mobile' ? '🚐 Remote Mobile Van' : '🏢 Drive-in Facility'} • #{b.id}
                  </div>
                  <div style={{ fontSize: 11, color: '#90A4AE' }}>Vehicle: {b.vehicleDetails?.make} {b.vehicleDetails?.model || ''}</div>
                </td>
                <td style={{ padding: '16px 16px' }}>
                  <div style={{ fontWeight: 600, color: '#1C2B3A' }}>{b.contactName || 'Customer'}</div>
                  <div style={{ fontSize: 11.5, color: '#607D8B' }}>{b.contactPhone || b.garagePhone}</div>
                </td>
                <td style={{ padding: '16px 16px', color: '#37474F' }}>
                  {b.serviceAddress}
                </td>
                <td style={{ padding: '16px 16px', color: '#37474F' }}>
                  <div>{b.scheduledDate}</div>
                  <div style={{ fontSize: 11, color: '#90A4AE' }}>{b.scheduledTime}</div>
                </td>
                <td style={{ padding: '16px 16px', fontWeight: 700, color: '#0F6E56' }}>
                  {b.estimatedCost}
                </td>
                <td style={{ padding: '16px 16px' }}>
                  <select 
                    value={b.status} 
                    onChange={e => handleStatusChange(b.id, e.target.value)}
                    style={{
                      background: b.status === 'confirmed' ? '#E1F5EE' : b.status === 'in_progress' ? '#E6F0FA' : '#FFF3E0',
                      color: b.status === 'confirmed' ? '#0F6E56' : b.status === 'in_progress' ? '#0A2085' : '#E65100',
                      border: '1px solid #D0DCE8',
                      borderRadius: 8,
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
                  <button onClick={() => handleDeleteBooking(b.id)} style={{ background: '#FFEBEE', color: '#C62828', border: 'none', padding: '6px 8px', borderRadius: 6, cursor: 'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. USERS TAB
// ─────────────────────────────────────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editCredits, setEditCredits] = useState('');
  const [editPlan, setEditPlan] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      setUsers(await APIService.getAdminUsers() || []);
    } catch (e) {
      alert(e.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateUser(userId, data) {
    try {
      await APIService.updateAdminUser(userId, data);
      loadUsers();
    } catch (e) {
      alert(e.message || 'Failed to update user');
    }
  }

  async function handleDeleteUser(userId) {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await APIService.deleteAdminUser(userId);
      loadUsers();
    } catch (e) {
      alert(e.message || 'Failed to delete user');
    }
  }

  async function handleSaveCredits(e) {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await APIService.updateAdminUserCredits(editingUser.id, parseInt(editCredits, 10), editPlan);
      setEditingUser(null);
      loadUsers();
    } catch (e) {
      alert(e.message || 'Failed to update credits');
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    if (!editingUser || !newPassword) return;
    try {
      await APIService.updateAdminUserPassword(editingUser.id, newPassword);
      setPasswordMsg('Password updated successfully!');
      setNewPassword('');
      setTimeout(() => setPasswordMsg(''), 3000);
    } catch (e) {
      alert(e.message || 'Failed to update password');
    }
  }

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div style={{ background: '#fff', borderRadius: 16, padding: '16px 20px', border: '1px solid #D0DCE8', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: '#F5F8FC', border: '1px solid #D0DCE8', borderRadius: 10, padding: '0 12px', minWidth: 280 }}>
          <Search size={16} color="#90A4AE" style={{ marginRight: 6 }} />
          <input 
            type="text" 
            placeholder="Search users by name or email..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            style={{ border: 'none', background: 'transparent', outline: 'none', padding: '10px 0', fontSize: 13, width: '100%' }}
          />
        </div>
        <div style={{ fontSize: 13, color: '#607D8B' }}>Total Registered Users: <strong>{users.length}</strong></div>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #D0DCE8', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #D0DCE8', color: '#607D8B' }}>
              <th style={{ padding: '14px 20px', fontWeight: 700 }}>USER</th>
              <th style={{ padding: '14px 16px', fontWeight: 700 }}>ROLE</th>
              <th style={{ padding: '14px 16px', fontWeight: 700 }}>PLAN</th>
              <th style={{ padding: '14px 16px', fontWeight: 700 }}>CREDITS</th>
              <th style={{ padding: '14px 16px', fontWeight: 700 }}>STATUS</th>
              <th style={{ padding: '14px 20px', fontWeight: 700, textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid #F0F4F8' }}>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ fontWeight: 700, color: '#1C2B3A' }}>{u.name}</div>
                  <div style={{ fontSize: 11.5, color: '#90A4AE' }}>{u.email}</div>
                </td>
                <td style={{ padding: '16px 16px' }}>
                  <select 
                    value={u.role} 
                    onChange={e => handleUpdateUser(u.id, { role: e.target.value })}
                    style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #D0DCE8', fontSize: 12, fontWeight: 600 }}
                  >
                    <option value="user">User</option>
                    <option value="technician">Technician</option>
                    <option value="fleet_manager">Fleet Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td style={{ padding: '16px 16px' }}>
                  <span style={{ background: '#E6F0FA', color: '#0A2085', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, textTransform: 'capitalize' }}>
                    {u.plan_type || 'Free'}
                  </span>
                </td>
                <td style={{ padding: '16px 16px', fontWeight: 700, color: '#0F6E56' }}>
                  {u.credits || 0}
                </td>
                <td style={{ padding: '16px 16px' }}>
                  <span style={{ background: u.is_active ? '#E1F5EE' : '#FFEBEE', color: u.is_active ? '#0F6E56' : '#C62828', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>
                    {u.is_active ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button 
                      onClick={() => {
                        setEditingUser(u);
                        setEditCredits(u.credits || 0);
                        setEditPlan(u.plan_type || 'free');
                      }}
                      style={{ background: '#F5F8FC', color: '#0A2085', border: '1px solid #D0DCE8', padding: '6px 8px', borderRadius: 6, cursor: 'pointer' }}
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(u.id)}
                      style={{ background: '#FFEBEE', color: '#C62828', border: 'none', padding: '6px 8px', borderRadius: 6, cursor: 'pointer' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 480, padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Manage User: {editingUser.name}</h2>
              <button onClick={() => setEditingUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#90A4AE' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveCredits} style={{ marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid #F0F4F8' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1C2B3A', marginBottom: 12 }}>Credits & Plan Tier</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#607D8B', marginBottom: 4 }}>CREDITS</label>
                  <input type="number" value={editCredits} onChange={e => setEditCredits(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #D0DCE8' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#607D8B', marginBottom: 4 }}>PLAN</label>
                  <select value={editPlan} onChange={e => setEditPlan(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #D0DCE8' }}>
                    <option value="free">Free</option>
                    <option value="starter">Starter</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
              </div>
              <button type="submit" style={{ background: '#0A2085', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Save Credits
              </button>
            </form>

            <form onSubmit={handleResetPassword}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1C2B3A', marginBottom: 8 }}>Reset User Password</div>
              {passwordMsg && <div style={{ color: '#0F6E56', fontSize: 12, marginBottom: 8 }}>{passwordMsg}</div>}
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="password" placeholder="New secure password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #D0DCE8' }} required />
                <button type="submit" style={{ background: '#F5F8FC', color: '#1C2B3A', border: '1px solid #D0DCE8', padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. PLANS & PRICING TAB
// ─────────────────────────────────────────────────────────────────────────────
function PlansTab() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadPlans(); }, []);

  async function loadPlans() {
    try {
      setLoading(true);
      setPlans(await APIService.getAdminPlans() || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #D0DCE8' }}>
      <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 16px 0', color: '#1C2B3A' }}>Active Pricing Tier Config</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {plans.map(p => (
          <div key={p.id} style={{ background: '#F8FAFC', padding: 20, borderRadius: 12, border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h4 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: '#1C2B3A' }}>{p.title}</h4>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#0A2085' }}>${p.price_usd}</span>
            </div>
            <p style={{ fontSize: 12, color: '#607D8B', margin: '0 0 10px 0' }}>{p.description}</p>
            <div style={{ fontSize: 12, color: '#0F6E56', fontWeight: 700 }}>Credits: {p.credits} queries</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. DISCOUNTS TAB
// ─────────────────────────────────────────────────────────────────────────────
function DiscountsTab() {
  const [discounts, setDiscounts] = useState([]);

  useEffect(() => {
    APIService.getAdminDiscounts().then(setDiscounts).catch(console.error);
  }, []);

  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #D0DCE8' }}>
      <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 16px 0', color: '#1C2B3A' }}>Promotional & Discount Codes</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {discounts.map(d => (
          <div key={d.id} style={{ background: '#F8FAFC', padding: 14, borderRadius: 10, border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ fontSize: 14, color: '#0A2085', fontFamily: 'monospace' }}>{d.code}</strong>
              <div style={{ fontSize: 11, color: '#607D8B', marginTop: 2 }}>
                {d.percentage_off ? `${d.percentage_off}% OFF` : `$${d.fixed_amount_off} OFF`}
              </div>
            </div>
            <span style={{ fontSize: 11, background: '#E1F5EE', color: '#0F6E56', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>
              Active
            </span>
          </div>
        ))}
        {discounts.length === 0 && <div style={{ fontSize: 13, color: '#607D8B', fontStyle: 'italic' }}>No active discount codes.</div>}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #D0DCE8', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
        <Icon size={22} />
      </div>
      <div>
        <div style={{ fontSize: 11.5, color: '#607D8B', fontWeight: 600, textTransform: 'uppercase' }}>{title}</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#1C2B3A' }}>{value}</div>
      </div>
    </div>
  );
}
