// src/components/layout/AppShell.jsx
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import APIService from '../../services/api';
import {
  MessageSquare,
  Car,
  Truck,
  Wrench,
  Package,
  FileText,
  Users,
  Settings,
  LogOut,
  Menu,
  Trash2,
  Plus,
  Camera,
  Store,
  DollarSign,
  Shield,
  Search,
  Sparkles
} from 'lucide-react';

const NAV = [
  { group: 'Intelligence', items: [
    { to: '/chat',          Icon: MessageSquare,     label: 'AI Chat', iconColorClass: 'adv-icon-blue' },
    { to: '/car-scanner',   Icon: Camera,             label: 'AI Car Scanner', badge: 'NEW', badgeColor: '#0A2085', badgeText: '#fff', iconColorClass: 'adv-icon-purple' },
    { to: '/vin',           Icon: Car,                label: 'VIN Lookup', iconColorClass: 'adv-icon-teal' },
  ]},
  { group: 'Operations & Service', items: [
    { to: '/repair-advice', Icon: Wrench,             label: 'Repair & Cost Estimator', iconColorClass: 'adv-icon-amber' },
    { to: '/garages',       Icon: Store,              label: 'Garages & Remote Mobile', iconColorClass: 'adv-icon-emerald' },
    { to: '/diagnostics',   Icon: Settings,           label: 'Diagnostics', iconColorClass: 'adv-icon-blue' },
  ]},
  { group: 'Reports', items: [
    { to: '/reports',       Icon: FileText,           label: 'Reports Center', iconColorClass: 'adv-icon-rose' },
  ]},
  { group: 'Administration', role: 'admin', items: [
    { to: '/admin/dashboard', Icon: Shield,           label: 'Admin Control Center', badge: 'ADMIN', badgeColor: '#2563EB', badgeText: '#fff', iconColorClass: 'adv-icon-purple' },
  ]},
];

const MOBILE_NAV_ITEMS = [
  { to: '/chat',          Icon: MessageSquare, label: 'AI Chat' },
  { to: '/car-scanner',   Icon: Camera,        label: 'Scanner' },
  { to: '/repair-advice', Icon: Wrench,        label: 'Estimator' },
  { to: '/garages',       Icon: Store,         label: 'Garages' },
  { to: '/vin',           Icon: Car,           label: 'VIN' },
  { to: '/diagnostics',   Icon: Settings,      label: 'Diagnostics' },
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [recentConvs, setRecentConvs] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(true);
      else setIsSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadConversations();
  }, [location.pathname]); // Refresh when navigating, especially back to /chat

  async function loadConversations() {
    try {
      const data = await APIService.getConversations();
      setRecentConvs(data.conversations || []);
    } catch (e) {
      console.error('Failed to load conversations', e);
    }
  }

  async function handleDeleteConv(e, id) {
    e.stopPropagation();
    try {
      await APIService.deleteConversation(id);
      setRecentConvs(prev => prev.filter(c => c.id !== id));
      if (location.pathname === `/chat/${id}`) {
        navigate('/chat');
      }
    } catch (e) {
      console.error('Failed to delete conversation', e);
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div style={{ display:'flex', height:'100vh', background:'#F5F8FC' }}>
      {/* Mobile Sidebar Overlay */}
      {isMobile && (
        <div 
          className={`sidebar-overlay ${!isSidebarOpen ? 'closed' : ''}`} 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={isMobile ? `mobile-sidebar ${!isSidebarOpen ? 'closed' : ''}` : ''}
        style={{ width: isSidebarOpen ? 220 : 72, minWidth: isSidebarOpen ? 220 : 72, transition: 'transform 0.3s ease, width 0.3s ease', background:'#fff', borderRight:'0.5px solid #D0DCE8', display:'flex', flexDirection:'column', overflow:'hidden' }}
      >

        {/* Logo */}
        <div style={{ padding:'20px 16px 10px', borderBottom:'1px solid var(--lgray)', display:'flex', alignItems:'center', justifyContent: isSidebarOpen ? 'space-between' : 'center' }}>
          {isSidebarOpen ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src="/favicon.png" alt="AAIA" style={{ height: 26, width: 26, objectFit: 'contain' }} />
              <span style={{ fontSize: 18, fontWeight: 800, color: '#0A2085', letterSpacing: '-0.02em' }}>AAIA</span>
            </div>
          ) : (
            <img src="/favicon.png" alt="AAIA" style={{ height: 26, width: 26, objectFit: 'contain' }} />
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background:'transparent', border:'none', cursor:'pointer', color:'#607D8B', padding: 6, borderRadius: 8 }} onMouseOver={e => e.currentTarget.style.background = '#F5F8FC'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
            <Menu size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ padding:'8px 6px', flex:1, overflow:'auto', overflowX: 'hidden' }}>
          {NAV.map(({ group, items, role }) => {
            if (role && user?.role !== role) return null;
            return (
              <div key={group} style={{ marginBottom:6 }}>
              {isSidebarOpen && <div style={{ fontSize:10, color:'#90A4AE', padding:'6px 10px 2px', textTransform:'uppercase', letterSpacing:'.5px', fontWeight: 700 }}>{group}</div>}
              {items.map(({ to, Icon, label, badge, badgeColor, badgeText, iconColorClass }) => (
                <NavLink key={to} to={to} title={label} onClick={() => isMobile && setIsSidebarOpen(false)} style={({ isActive }) => ({
                  display:'flex', alignItems:'center', gap:10, padding:'7px 10px',
                  justifyContent: isSidebarOpen ? 'flex-start' : 'center',
                  borderRadius:10, textDecoration:'none', fontSize:13,
                  color: isActive ? '#0A2085' : '#475569',
                  background: isActive ? '#EFF6FF' : 'transparent',
                  fontWeight: isActive ? 700 : 500,
                  transition: 'all 0.15s ease'
                })}>
                  <div className={`adv-icon-badge ${iconColorClass || 'adv-icon-blue'}`} style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0 }}>
                    <Icon size={15} strokeWidth={2.2} />
                  </div>
                  {isSidebarOpen && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>}
                  {isSidebarOpen && badge && (
                    <span style={{ marginLeft:'auto', background:badgeColor, color:badgeText, borderRadius:10, padding:'1px 6px', fontSize:9.5, fontWeight:700 }}>
                      {badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
            );
          })}
          {/* Recent conversations */}
          {isSidebarOpen && (
            <div style={{ padding:'12px 6px 6px' }}>
              <div style={{ fontSize:10, color:'#90A4AE', padding:'4px 10px 3px', textTransform:'uppercase', letterSpacing:'.5px', fontWeight: 700 }}>Recent Activity</div>
              {recentConvs.map((c, i) => (
                <div key={c.id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding:'6px 10px', borderRadius:8, cursor:'pointer' }}
                  onClick={() => navigate(c.id ? `/chat/${c.id}` : '/chat')}
                  onMouseOver={e => e.currentTarget.style.background = '#F5F8FC'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ fontSize:11.5, color:'#64748B', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', flex: 1 }}>
                    {c.title || c}
                  </div>
                  {c.id && (
                    <button
                      onClick={(e) => handleDeleteConv(e, c.id)}
                      title="Delete conversation"
                      style={{ background:'transparent', border:'none', padding:2, color:'#90A4AE', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', minHeight:'unset' }}
                      onMouseOver={e => e.currentTarget.style.color = '#D32F2F'}
                      onMouseOut={e => e.currentTarget.style.color = '#90A4AE'}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
              {recentConvs.length === 0 && (
                <div style={{ fontSize:11, color:'#90A4AE', padding:'4px 10px', fontStyle: 'italic' }}>No recent chats</div>
              )}
            </div>
          )}
        </nav>

        {/* User */}
        <div style={{ padding:'8px 6px', borderTop:'0.5px solid #D0DCE8' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 10px', borderRadius:8, cursor:'pointer', justifyContent: isSidebarOpen ? 'flex-start' : 'center' }}
            onClick={() => navigate('/console')} title="Settings">
            <div style={{ width:28, height:28, borderRadius:'50%', background:'#E1F5EE', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600, color:'#0F6E56', flexShrink:0 }}>
              {user?.name?.slice(0,2).toUpperCase() || 'AT'}
            </div>
            {isSidebarOpen && (
              <>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:500, color:'#1C2B3A', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name || 'User'}</div>
                  <div style={{ fontSize:10.5, color:'#90A4AE' }}>Enterprise plan</div>
                </div>
                <Settings size={14} color="#90A4AE" />
              </>
            )}
          </div>
          {isSidebarOpen && (
            <div style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 10px', marginTop: 4, borderRadius:8, cursor:'pointer', color: '#90A4AE' }}
              onClick={handleLogout} title="Logout"
              onMouseOver={e => e.currentTarget.style.color = '#D32F2F'}
              onMouseOut={e => e.currentTarget.style.color = '#90A4AE'}
            >
              <LogOut size={14} />
              <div style={{ fontSize:11, fontWeight:500 }}>Log out</div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content-area" style={{ flex:1, display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden', position: 'relative' }}>
        {/* Mobile Header Toggle */}
        {isMobile && (
          <div style={{ padding: 'calc(env(safe-area-inset-top, 0px) + 10px) 16px 10px', background: '#fff', borderBottom: '1px solid #D0DCE8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'transparent', border: 'none', color: '#1C2B3A', padding: '4px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <Menu size={22} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }} onClick={() => navigate('/')}>
                <img src="/favicon.png" alt="AAIA" style={{ height: 24, width: 24, objectFit: 'contain' }} />
                <span style={{ fontSize: 17, fontWeight: 800, color: '#0A2085', letterSpacing: '-0.02em' }}>AAIA</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {user?.role === 'admin' && (
                <NavLink to="/admin/dashboard" style={{ background: '#EFF6FF', color: '#2563EB', textDecoration: 'none', padding: '4px 9px', borderRadius: 6, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Shield size={12} /> Admin
                </NavLink>
              )}
              <div
                onClick={() => navigate('/console/profile')}
                title="Account Settings"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: '#0A2085',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {user?.name?.slice(0, 2).toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        )}

        <Outlet />

        {/* ── Native Mobile Bottom Navigation Bar ── */}
        <nav className="mobile-bottom-nav">
          {MOBILE_NAV_ITEMS.map(({ to, Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
            >
              <div className="mobile-nav-icon">
                <Icon size={20} strokeWidth={2.2} />
              </div>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </main>
    </div>
  );
}
