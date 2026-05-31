import { useState, useEffect } from 'react';
import APIService from '../services/api';

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'plans', 'discounts'

  return (
    <div style={{ padding: 40, background: '#F5F8FC', minHeight: '100%', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: '#1C2B3A', margin: 0 }}>Admin Dashboard</h1>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid #D0DCE8', marginBottom: 32 }}>
        <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')}>Users</TabButton>
        <TabButton active={activeTab === 'plans'} onClick={() => setActiveTab('plans')}>Pricing Plans</TabButton>
        <TabButton active={activeTab === 'discounts'} onClick={() => setActiveTab('discounts')}>Discounts</TabButton>
      </div>

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
        fontSize: 15,
        fontWeight: active ? 600 : 500,
        color: active ? '#0A2540' : '#607D8B',
        borderBottom: active ? '3px solid #0A2540' : '3px solid transparent',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// USERS TAB
// ─────────────────────────────────────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
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

  async function handleRoleChange(id, newRole) {
    try {
      const updatedUser = await APIService.updateAdminUser(id, { role: newRole });
      setUsers(users.map(u => u.id === id ? { ...u, role: updatedUser.role } : u));
    } catch (e) { alert(e.message || 'Failed to update user role'); }
  }

  async function handleSaveCredits() {
    if (!editingUser) return;
    try {
      const updated = await APIService.updateAdminUserCredits(editingUser.id, editCredits, editPlan);
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, credits: updated.credits, plan_type: updated.plan_type } : u));
      setEditingUser(null);
    } catch(e) { alert(e.message); }
  }

  async function handleChangePassword() {
    if (!editingUser || !newPassword) return;
    try {
      await APIService.updateAdminUserPassword(editingUser.id, newPassword);
      setPasswordMsg('Password changed successfully!');
      setNewPassword('');
      setTimeout(() => setPasswordMsg(''), 3000);
    } catch(e) { alert(e.message || 'Failed to change password'); }
  }

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) return <div>Loading users...</div>;

  return (
    <div>
      <input type="text" placeholder="Search users..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{...inputStyle, marginBottom: 16, width: 300}} />
      <div style={cardStyle}>
        <table style={tableStyle}>
          <thead style={theadStyle}>
            <tr>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Role</th>
              <th style={thStyle}>Plan</th>
              <th style={thStyle}>Credits</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => (
              <tr key={u.id} style={trStyle}>
                <td style={tdStyle}>{u.name}</td>
                <td style={tdStyle}>{u.email}</td>
                <td style={tdStyle}>
                  <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)} style={selectStyle}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td style={tdStyle}><span style={badgeStyle(u.plan_type === 'enterprise' ? '#E1F5EE' : '#F8FAFC', u.plan_type === 'enterprise' ? '#0F6E56' : '#607D8B')}>{u.plan_type || 'free'}</span></td>
                <td style={tdStyle}><b>{parseFloat(u.credits || 0).toLocaleString()}</b></td>
                <td style={tdStyle}>
                  <button onClick={() => { setEditingUser(u); setEditCredits(u.credits); setEditPlan(u.plan_type); setNewPassword(''); setPasswordMsg(''); }} style={primaryBtnSmall}>Manage User</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <Modal onClose={() => setEditingUser(null)} title={`Manage: ${editingUser.name}`}>
          {/* User Info & Support details */}
          <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 8, marginBottom: 24, fontSize: 13, color: '#455A64' }}>
            <div style={{ marginBottom: 4 }}><b>Email:</b> {editingUser.email}</div>
            <div style={{ marginBottom: 4 }}><b>Phone:</b> {editingUser.phone || 'N/A'}</div>
            <div style={{ marginBottom: 4 }}><b>Company:</b> {editingUser.company || 'N/A'}</div>
            <div><b>Joined:</b> {new Date(editingUser.created_at).toLocaleDateString()}</div>
          </div>

          <h3 style={{ fontSize: 16, marginBottom: 12, color: '#1C2B3A' }}>Credits & Plan</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div>
              <label style={labelStyle}>Plan Type</label>
              <select value={editPlan} onChange={e => setEditPlan(e.target.value)} style={inputStyle}>
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="max">Max</option>
                <option value="ultra">Ultra</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Credits</label>
              <input type="number" value={editCredits} onChange={e => setEditCredits(e.target.value)} style={inputStyle} />
            </div>
          </div>
          <button onClick={handleSaveCredits} style={{...primaryBtnSmall, width: '100%', marginBottom: 32}}>Save Plan & Credits</button>

          <h3 style={{ fontSize: 16, marginBottom: 12, color: '#1C2B3A' }}>Security</h3>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Set New Password</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input 
                type="text" 
                placeholder="Enter new password" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                style={inputStyle} 
              />
              <button onClick={handleChangePassword} style={{...primaryBtn, whiteSpace: 'nowrap'}}>Update Password</button>
            </div>
            {passwordMsg && <div style={{ fontSize: 13, color: '#0F6E56', marginTop: 8 }}>{passwordMsg}</div>}
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PLANS TAB
// ─────────────────────────────────────────────────────────────────────────────
function PlansTab() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState(null);

  const [form, setForm] = useState({ title: '', description: '', price_usd: 0, credits: 0, interval: 'month', tab: 'individual', is_popular: false, features: '', is_active: true });

  useEffect(() => { loadPlans(); }, []);

  async function loadPlans() {
    try {
      setLoading(true);
      setPlans(await APIService.getAdminPlans() || []);
    } catch(e) { alert(e.message); } finally { setLoading(false); }
  }

  async function handleSave() {
    try {
      const payload = { ...form, features: form.features.split(',').map(f => f.trim()).filter(Boolean) };
      if (editingPlan && editingPlan.id) {
        await APIService.updateAdminPlan(editingPlan.id, payload);
      } else {
        await APIService.createAdminPlan(payload);
      }
      setEditingPlan(null);
      loadPlans();
    } catch(e) { alert(e.message); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this plan?')) return;
    try { await APIService.deleteAdminPlan(id); loadPlans(); } catch(e) { alert(e.message); }
  }

  if (loading) return <div>Loading plans...</div>;

  return (
    <div>
      <button onClick={() => { setEditingPlan(true); setForm({ title: '', description: '', price_usd: 0, credits: 0, interval: 'month', tab: 'individual', is_popular: false, features: '', is_active: true }); }} style={{...primaryBtn, marginBottom: 16}}>+ Create Plan</button>
      
      <div style={cardStyle}>
        <table style={tableStyle}>
          <thead style={theadStyle}>
            <tr>
              <th style={thStyle}>Title</th>
              <th style={thStyle}>Price</th>
              <th style={thStyle}>Credits</th>
              <th style={thStyle}>Tab</th>
              <th style={thStyle}>Active</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.map(p => (
              <tr key={p.id} style={trStyle}>
                <td style={tdStyle}><b>{p.title}</b></td>
                <td style={tdStyle}>${parseFloat(p.price_usd).toFixed(2)}</td>
                <td style={tdStyle}>{p.credits == 999999 ? 'Unlimited' : parseFloat(p.credits).toLocaleString()}</td>
                <td style={tdStyle}>{p.tab}</td>
                <td style={tdStyle}>{p.is_active ? 'Yes' : 'No'}</td>
                <td style={tdStyle}>
                  <button onClick={() => { setEditingPlan(p); setForm({ ...p, features: Array.isArray(p.features) ? p.features.join(', ') : '' }); }} style={{...primaryBtnSmall, marginRight: 8}}>Edit</button>
                  <button onClick={() => handleDelete(p.id)} style={dangerBtnSmall}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingPlan && (
        <Modal onClose={() => setEditingPlan(null)} title={editingPlan.id ? 'Edit Plan' : 'Create Plan'}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div><label style={labelStyle}>Title</label><input type="text" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} style={inputStyle} /></div>
            <div><label style={labelStyle}>Price (USD)</label><input type="number" value={form.price_usd} onChange={e=>setForm({...form, price_usd: e.target.value})} style={inputStyle} /></div>
            <div><label style={labelStyle}>Credits</label><input type="number" value={form.credits} onChange={e=>setForm({...form, credits: e.target.value})} style={inputStyle} /></div>
            <div><label style={labelStyle}>Interval</label><select value={form.interval} onChange={e=>setForm({...form, interval: e.target.value})} style={inputStyle}><option value="month">Month</option><option value="year">Year</option></select></div>
            <div><label style={labelStyle}>Tab Category</label><select value={form.tab} onChange={e=>setForm({...form, tab: e.target.value})} style={inputStyle}><option value="individual">Individual</option><option value="enterprise">Enterprise</option></select></div>
            <div><label style={{...labelStyle, display: 'flex', alignItems: 'center', gap: 8}}><input type="checkbox" checked={form.is_popular} onChange={e=>setForm({...form, is_popular: e.target.checked})} /> Mark as Most Popular</label></div>
          </div>
          <div style={{ marginBottom: 16 }}><label style={labelStyle}>Description</label><input type="text" value={form.description} onChange={e=>setForm({...form, description: e.target.value})} style={inputStyle} /></div>
          <div style={{ marginBottom: 24 }}><label style={labelStyle}>Features (comma separated)</label><textarea value={form.features} onChange={e=>setForm({...form, features: e.target.value})} style={{...inputStyle, height: 80, resize: 'none'}} /></div>
          <button onClick={handleSave} style={{...primaryBtn, width: '100%'}}>Save Plan</button>
        </Modal>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DISCOUNTS TAB
// ─────────────────────────────────────────────────────────────────────────────
function DiscountsTab() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ code: '', percentage_off: '', fixed_amount_off: '', max_uses: '' });

  useEffect(() => { loadDiscounts(); }, []);

  async function loadDiscounts() {
    try { setLoading(true); setDiscounts(await APIService.getAdminDiscounts() || []); } 
    catch(e) { alert(e.message); } finally { setLoading(false); }
  }

  async function handleCreate() {
    try { await APIService.createAdminDiscount(form); setCreating(false); loadDiscounts(); }
    catch(e) { alert(e.message); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this code?')) return;
    try { await APIService.deleteAdminDiscount(id); loadDiscounts(); } catch(e) { alert(e.message); }
  }

  if (loading) return <div>Loading discounts...</div>;

  return (
    <div>
      <button onClick={() => { setCreating(true); setForm({ code: '', percentage_off: '', fixed_amount_off: '', max_uses: '' }); }} style={{...primaryBtn, marginBottom: 16}}>+ Create Code</button>
      
      <div style={cardStyle}>
        <table style={tableStyle}>
          <thead style={theadStyle}>
            <tr>
              <th style={thStyle}>Code</th>
              <th style={thStyle}>Discount</th>
              <th style={thStyle}>Uses</th>
              <th style={thStyle}>Max Uses</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {discounts.map(d => (
              <tr key={d.id} style={trStyle}>
                <td style={tdStyle}><span style={{...badgeStyle('#F0F4F8', '#1C2B3A'), fontFamily: 'monospace', fontSize: 14}}>{d.code}</span></td>
                <td style={tdStyle}>{d.percentage_off ? `${parseFloat(d.percentage_off)}% OFF` : `$${parseFloat(d.fixed_amount_off)} OFF`}</td>
                <td style={tdStyle}>{d.uses}</td>
                <td style={tdStyle}>{d.max_uses || 'Unlimited'}</td>
                <td style={tdStyle}><button onClick={() => handleDelete(d.id)} style={dangerBtnSmall}>Delete</button></td>
              </tr>
            ))}
            {discounts.length === 0 && <tr><td colSpan="5" style={{padding: 24, textAlign: 'center'}}>No discount codes active.</td></tr>}
          </tbody>
        </table>
      </div>

      {creating && (
        <Modal onClose={() => setCreating(false)} title="Create Promo Code">
          <div style={{ marginBottom: 16 }}><label style={labelStyle}>Code</label><input type="text" placeholder="e.g. SUMMER50" value={form.code} onChange={e=>setForm({...form, code: e.target.value.toUpperCase()})} style={inputStyle} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div><label style={labelStyle}>Percentage Off (%)</label><input type="number" placeholder="Optional" value={form.percentage_off} onChange={e=>setForm({...form, percentage_off: e.target.value})} style={inputStyle} /></div>
            <div><label style={labelStyle}>Fixed Amount Off ($)</label><input type="number" placeholder="Optional" value={form.fixed_amount_off} onChange={e=>setForm({...form, fixed_amount_off: e.target.value})} style={inputStyle} /></div>
          </div>
          <div style={{ marginBottom: 24 }}><label style={labelStyle}>Max Uses (Optional)</label><input type="number" placeholder="Leave blank for unlimited" value={form.max_uses} onChange={e=>setForm({...form, max_uses: e.target.value})} style={inputStyle} /></div>
          <button onClick={handleCreate} style={{...primaryBtn, width: '100%'}}>Create Code</button>
        </Modal>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REUSABLE UI
// ─────────────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', padding: 32, borderRadius: 16, width: 500, maxWidth: '90%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#90A4AE' }}>&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const cardStyle = { background: '#fff', borderRadius: 12, border: '1px solid #D0DCE8', overflow: 'hidden' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 };
const theadStyle = { background: '#F8FAFC', borderBottom: '1px solid #D0DCE8' };
const thStyle = { padding: '12px 16px', fontWeight: 600, color: '#607D8B', textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.5px' };
const trStyle = { borderBottom: '1px solid #F0F4F8' };
const tdStyle = { padding: '12px 16px', verticalAlign: 'middle', color: '#1C2B3A' };
const inputStyle = { width: '100%', boxSizing: 'border-box', height: 38, borderRadius: 8, border: '1px solid #D0DCE8', padding: '0 12px', fontSize: 14, outline: 'none' };
const selectStyle = { padding: '4px 8px', borderRadius: 6, border: '1px solid #D0DCE8', fontSize: 12, outline: 'none' };
const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, color: '#1C2B3A', marginBottom: 8 };
const primaryBtn = { background: '#0A2540', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer' };
const primaryBtnSmall = { background: '#E3E8EE', color: '#0A2540', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer' };
const dangerBtnSmall = { background: '#FCEBEB', color: '#A32D2D', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer' };
const badgeStyle = (bg, color) => ({ background: bg, color: color, padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, display: 'inline-block' });
