// src/pages/admin/AdminUsersPage.jsx
import React, { useState, useEffect } from 'react';
import APIService from '../../services/api';
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  KeyRound,
  Shield,
  CreditCard,
  Building,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  X,
  RefreshCw,
  AlertCircle,
  Filter
} from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [passwordUser, setPasswordUser] = useState(null);

  // Form states
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    plan_type: 'free',
    credits: 5,
    company: '',
    phone: '',
    is_active: true
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    plan_type: 'free',
    credits: 5,
    company: '',
    phone: '',
    is_active: true
  });

  const [newPassword, setNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      setError(null);
      const data = await APIService.getAdminUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError(err.message || 'Unable to load registered user records.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUser(e) {
    e.preventDefault();
    setFormError('');
    try {
      await APIService.createAdminUser(newUserData);
      setCreateModalOpen(false);
      setNewUserData({
        name: '',
        email: '',
        password: '',
        role: 'user',
        plan_type: 'free',
        credits: 5,
        company: '',
        phone: '',
        is_active: true
      });
      loadUsers();
    } catch (err) {
      setFormError(err.message || 'Failed to create user account.');
    }
  }

  async function handleUpdateUser(e) {
    e.preventDefault();
    if (!editUser) return;
    setFormError('');
    try {
      await APIService.updateAdminUser(editUser.id, {
        name: editFormData.name,
        email: editFormData.email,
        role: editFormData.role,
        plan_type: editFormData.plan_type,
        company: editFormData.company,
        phone: editFormData.phone,
        is_active: editFormData.is_active,
        password: editFormData.password ? editFormData.password.trim() : undefined
      });

      // Update credits if changed
      if (editFormData.credits !== editUser.credits) {
        await APIService.updateAdminUserCredits(editUser.id, parseFloat(editFormData.credits), editFormData.plan_type);
      }

      setEditUser(null);
      loadUsers();
    } catch (err) {
      setFormError(err.message || 'Failed to update user.');
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    if (!passwordUser || !newPassword) return;
    setFormError('');
    try {
      await APIService.updateAdminUserPassword(passwordUser.id, newPassword);
      setPasswordSuccess('Password updated successfully!');
      setNewPassword('');
      setTimeout(() => {
        setPasswordSuccess('');
        setPasswordUser(null);
      }, 1500);
    } catch (err) {
      setFormError(err.message || 'Failed to update user password.');
    }
  }

  async function handleDeleteUser(user) {
    if (!window.confirm(`Are you sure you want to permanently delete user "${user.name || user.email}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await APIService.deleteAdminUser(user.id);
      loadUsers();
    } catch (err) {
      alert(err.message || 'Failed to delete user.');
    }
  }

  // Safe Filtering
  const filteredUsers = (users || []).filter(u => {
    const name = (u.name || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const company = (u.company || '').toLowerCase();
    const phone = (u.phone || '').toLowerCase();
    const q = (searchQuery || '').toLowerCase();

    const matchesSearch = !q || name.includes(q) || email.includes(q) || company.includes(q) || phone.includes(q);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? u.is_active : !u.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#E0F2FE', color: '#0369A1', padding: '4px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 700, marginBottom: 6 }}>
            <Users size={14} /> Access Control & Membership
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.5px' }}>
            User Management
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={loadUsers}
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
              setFormError('');
              setCreateModalOpen(true);
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
            <span>Add New User</span>
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '14px 18px', color: '#B91C1C', marginBottom: 20, fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

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
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 9, padding: '0 12px', minWidth: 280, flex: '1 1 280px' }}>
          <Search size={16} color="#94A3B8" style={{ marginRight: 8, flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search by name, email, company, or phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', padding: '9px 0', fontSize: 13, width: '100%', color: '#1E293B' }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>Role:</span>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 8, padding: '6px 10px', fontSize: 12.5, color: '#1E293B', fontWeight: 600 }}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="enterprise">Enterprise</option>
              <option value="developer">Developer</option>
              <option value="user">Regular User</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 8, padding: '6px 10px', fontSize: 12.5, color: '#1E293B', fontWeight: 600 }}
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="disabled">Disabled Only</option>
            </select>
          </div>

          <div style={{ fontSize: 12.5, color: '#64748B', fontWeight: 600, paddingLeft: 8 }}>
            Total: <strong style={{ color: '#0F172A' }}>{filteredUsers.length}</strong>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                <th style={{ padding: '14px 20px', fontWeight: 700 }}>USER</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>ROLE</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>PLAN TIER</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>CREDITS</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>STATUS</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>COMPANY / PHONE</th>
                <th style={{ padding: '14px 20px', fontWeight: 700, textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        background: u.role === 'admin' ? '#EFF6FF' : '#F1F5F9',
                        color: u.role === 'admin' ? '#2563EB' : '#475569',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 700,
                        flexShrink: 0
                      }}>
                        {u.name?.slice(0, 2).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0F172A' }}>{u.name || 'Unnamed User'}</div>
                        <div style={{ fontSize: 11.5, color: '#64748B' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: '16px 16px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 6,
                      textTransform: 'uppercase',
                      background: u.role === 'admin' ? '#EFF6FF' : u.role === 'enterprise' ? '#F5F3FF' : '#F1F5F9',
                      color: u.role === 'admin' ? '#1D4ED8' : u.role === 'enterprise' ? '#6D28D9' : '#475569'
                    }}>
                      {u.role === 'admin' && <Shield size={11} />}
                      {u.role || 'user'}
                    </span>
                  </td>

                  <td style={{ padding: '16px 16px' }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 6,
                      textTransform: 'capitalize',
                      background: u.plan_type === 'enterprise' ? '#FEF3C7' : u.plan_type === 'pro' ? '#E0E7FF' : '#F1F5F9',
                      color: u.plan_type === 'enterprise' ? '#92400E' : u.plan_type === 'pro' ? '#3730A3' : '#475569'
                    }}>
                      {u.plan_type || 'free'}
                    </span>
                  </td>

                  <td style={{ padding: '16px 16px', fontWeight: 700, color: '#0F766E' }}>
                    {u.credits ?? 0}
                  </td>

                  <td style={{ padding: '16px 16px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: u.is_active ? '#F0FDF4' : '#FEF2F2',
                      color: u.is_active ? '#15803D' : '#B91C1C'
                    }}>
                      {u.is_active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      {u.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>

                  <td style={{ padding: '16px 16px', color: '#64748B', fontSize: 12 }}>
                    <div>{u.company || '—'}</div>
                    <div style={{ fontSize: 11 }}>{u.phone || '—'}</div>
                  </td>

                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => {
                          setEditUser(u);
                          setEditFormData({
                            name: u.name || '',
                            email: u.email || '',
                            password: '',
                            role: u.role || 'user',
                            plan_type: u.plan_type || 'free',
                            credits: u.credits ?? 5,
                            company: u.company || '',
                            phone: u.phone || '',
                            is_active: u.is_active !== false
                          });
                          setFormError('');
                        }}
                        title="Edit User"
                        style={{ background: '#F8FAFC', color: '#2563EB', border: '1px solid #CBD5E1', padding: '6px 8px', borderRadius: 7, cursor: 'pointer' }}
                      >
                        <Edit size={14} />
                      </button>

                      <button
                        onClick={() => {
                          setPasswordUser(u);
                          setNewPassword('');
                          setPasswordSuccess('');
                          setFormError('');
                        }}
                        title="Reset Password"
                        style={{ background: '#F8FAFC', color: '#D97706', border: '1px solid #CBD5E1', padding: '6px 8px', borderRadius: 7, cursor: 'pointer' }}
                      >
                        <KeyRound size={14} />
                      </button>

                      <button
                        onClick={() => handleDeleteUser(u)}
                        title="Delete User"
                        style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', padding: '6px 8px', borderRadius: 7, cursor: 'pointer' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>
                    {loading ? 'Loading user directory…' : 'No users found matching current filters.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE USER MODAL */}
      {createModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#FFFFFF', borderRadius: 20, width: '100%', maxWidth: 520, padding: 28, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>Add New User</h2>
              <button onClick={() => setCreateModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><X size={20} /></button>
            </div>

            {formError && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', color: '#B91C1C', marginBottom: 16, fontSize: 12.5 }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>FULL NAME</label>
                <input
                  type="text"
                  value={newUserData.name}
                  onChange={e => setNewUserData({ ...newUserData, name: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>EMAIL</label>
                  <input
                    type="email"
                    value={newUserData.email}
                    onChange={e => setNewUserData({ ...newUserData, email: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>PASSWORD</label>
                  <input
                    type="password"
                    value={newUserData.password}
                    onChange={e => setNewUserData({ ...newUserData, password: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>ROLE</label>
                  <select
                    value={newUserData.role}
                    onChange={e => setNewUserData({ ...newUserData, role: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                  >
                    <option value="user">User</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="developer">Developer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>PLAN TIER</label>
                  <select
                    value={newUserData.plan_type}
                    onChange={e => setNewUserData({ ...newUserData, plan_type: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                  >
                    <option value="free">Free</option>
                    <option value="starter">Starter</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>INITIAL CREDITS</label>
                  <input
                    type="number"
                    value={newUserData.credits}
                    onChange={e => setNewUserData({ ...newUserData, credits: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>COMPANY / ORG</label>
                  <input
                    type="text"
                    value={newUserData.company}
                    onChange={e => setNewUserData({ ...newUserData, company: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>PHONE NUMBER</label>
                <input
                  type="text"
                  value={newUserData.phone}
                  onChange={e => setNewUserData({ ...newUserData, phone: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                />
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
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#FFFFFF', borderRadius: 20, width: '100%', maxWidth: 520, padding: 28, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>Edit User: {editUser.name || editUser.email}</h2>
              <button onClick={() => setEditUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><X size={20} /></button>
            </div>

            {formError && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', color: '#B91C1C', marginBottom: 16, fontSize: 12.5 }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleUpdateUser} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>FULL NAME</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>EMAIL</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={e => setEditFormData({ ...editFormData, email: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>ROLE</label>
                  <select
                    value={editFormData.role}
                    onChange={e => setEditFormData({ ...editFormData, role: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                  >
                    <option value="user">User</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="developer">Developer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>PLAN TIER</label>
                  <select
                    value={editFormData.plan_type}
                    onChange={e => setEditFormData({ ...editFormData, plan_type: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                  >
                    <option value="free">Free</option>
                    <option value="starter">Starter</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>CREDITS BALANCE</label>
                  <input
                    type="number"
                    value={editFormData.credits}
                    onChange={e => setEditFormData({ ...editFormData, credits: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>ACCOUNT STATUS</label>
                  <select
                    value={editFormData.is_active ? 'active' : 'disabled'}
                    onChange={e => setEditFormData({ ...editFormData, is_active: e.target.value === 'active' })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                  >
                    <option value="active">Active</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>COMPANY</label>
                  <input
                    type="text"
                    value={editFormData.company}
                    onChange={e => setEditFormData({ ...editFormData, company: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>PHONE</label>
                  <input
                    type="text"
                    value={editFormData.phone}
                    onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#D97706', marginBottom: 4 }}>
                  RESET PASSWORD (OPTIONAL — LEAVE BLANK TO KEEP CURRENT)
                </label>
                <input
                  type="password"
                  placeholder="Enter new password to overwrite (min 6 characters)"
                  value={editFormData.password || ''}
                  onChange={e => setEditFormData({ ...editFormData, password: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #F59E0B', background: '#FFFBEB', fontSize: 13 }}
                />
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
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {passwordUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#FFFFFF', borderRadius: 20, width: '100%', maxWidth: 460, padding: 28, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>Reset Password: {passwordUser.name}</h2>
              <button onClick={() => setPasswordUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><X size={20} /></button>
            </div>

            {formError && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', color: '#B91C1C', marginBottom: 16, fontSize: 12.5 }}>
                {formError}
              </div>
            )}

            {passwordSuccess && (
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '10px 14px', color: '#15803D', marginBottom: 16, fontSize: 12.5 }}>
                {passwordSuccess}
              </div>
            )}

            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>NEW SECURE PASSWORD</label>
                <input
                  type="password"
                  placeholder="Enter new password (min 6 characters)"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                  required
                />
              </div>

              <button
                type="submit"
                style={{
                  background: '#D97706',
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
                Overwrite Password
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
