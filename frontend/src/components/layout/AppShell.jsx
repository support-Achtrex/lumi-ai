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
  Shield
} from 'lucide-react';

const NAV = [
  { group: 'Intelligence', items: [
    { to: '/chat',          Icon: MessageSquare,     label: 'AI Chat' },
    { to: '/car-scanner',   Icon: Camera,             label: 'AI Car Scanner', badge: 'NEW', badgeColor: '#0A2085', badgeText: '#fff' },
    { to: '/vin',           Icon: Car,                label: 'VIN Lookup' },
  ]},
  { group: 'Operations & Service', items: [
    { to: '/repair-advice', Icon: Wrench,             label: 'Repair & Cost Estimator' },
    { to: '/garages',       Icon: Store,              label: 'Garages & Remote Mobile' },
    { to: '/diagnostics',   Icon: Settings,           label: 'Diagnostics' },
  ]},
  { group: 'Reports', items: [
    { to: '/reports',       Icon: FileText,           label: 'Reports Center' },
  ]},
  { group: 'Administration', role: 'admin', items: [
    { to: '/admin/dashboard', Icon: Shield,           label: 'Admin Control Center', badge: 'ADMIN', badgeColor: '#2563EB', badgeText: '#fff' },
  ]},
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
        style={{ width: isSidebarOpen ? 210 : 72, minWidth: isSidebarOpen ? 210 : 72, transition: 'transform 0.3s ease, width 0.3s ease', background:'#fff', borderRight:'0.5px solid #D0DCE8', display:'flex', flexDirection:'column', overflow:'hidden' }}
      >

        {/* Logo */}
        <div style={{ padding:'20px 16px 10px', borderBottom:'1px solid var(--lgray)', display:'flex', alignItems:'center', justifyContent: isSidebarOpen ? 'space-between' : 'center' }}>
          {isSidebarOpen && <img src="/logo.png" alt="AAIA" style={{ height: 32, objectFit: 'contain' }} />}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background:'transparent', border:'none', cursor:'pointer', color:'#607D8B', padding: 6, borderRadius: 8 }} onMouseOver={e => e.currentTarget.style.background = '#F5F8FC'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
            <Menu size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ padding:'8px 6px', flex:1, overflow:'auto', overflowX: 'hidden' }}>
          {NAV.map(({ group, items, role }) => {
            if (role && user?.role !== role) return null;
            return (
              <div key={group} style={{ marginBottom:4 }}>
              {isSidebarOpen && <div style={{ fontSize:10, color:'#90A4AE', padding:'6px 10px 2px', textTransform:'uppercase', letterSpacing:'.5px' }}>{group}</div>}
              {items.map(({ to, Icon, label, badge, badgeColor, badgeText }) => (
                <NavLink key={to} to={to} title={label} onClick={() => isMobile && setIsSidebarOpen(false)} style={({ isActive }) => ({
                  display:'flex', alignItems:'center', gap:8, padding:'7px 10px',
                  justifyContent: isSidebarOpen ? 'flex-start' : 'center',
                  borderRadius:8, textDecoration:'none', fontSize:12.5,
                  color: isActive ? '#0A2085' : '#607D8B',
                  background: isActive ? '#F0F5FF' : 'transparent',
                  fontWeight: isActive ? 600 : 400,
                  transition: 'all 0.15s ease'
                })}>
                  <Icon size={16} strokeWidth={2} style={{ flexShrink: 0 }} />
                  {isSidebarOpen && <span>{label}</span>}
                  {isSidebarOpen && badge && (
                    <span style={{ marginLeft:'auto', background:badgeColor, color:badgeText, borderRadius:10, padding:'1px 6px', fontSize:10, fontWeight:500 }}>
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
            <div style={{ padding:'16px 6px 6px' }}>
              <div style={{ fontSize:10, color:'#90A4AE', padding:'4px 10px 3px', textTransform:'uppercase', letterSpacing:'.5px' }}>Recent</div>
              {recentConvs.map((c, i) => (
                <div key={c.id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding:'6px 10px', borderRadius:8, cursor:'pointer' }}
                  onClick={() => navigate(c.id ? `/chat/${c.id}` : '/chat')}
                  onMouseOver={e => e.currentTarget.style.background = '#F5F8FC'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ fontSize:11, color:'#607D8B', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', flex: 1 }}>
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
      <main className="main-content-area" style={{ flex:1, display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden' }}>
        {/* Mobile Header Toggle */}
        {isMobile && (
          <div style={{ padding: '16px', background: '#fff', borderBottom: '1px solid #D0DCE8', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'transparent', border: 'none', color: '#1C2B3A', padding: '4px' }}>
              <Menu size={24} />
            </button>
            <img src="/logo.png" alt="AAIA" style={{ height: 24 }} />
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
}
