// src/components/layout/AppShell.jsx
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import APIService from '../../services/api';

const NAV = [
  { group: 'Intelligence', items: [
    { to: '/chat',        icon: 'ti-message-2',     label: 'Chat' },
    { to: '/vin',         icon: 'ti-car',           label: 'VIN lookup' },
    { to: '/workflow',    icon: 'ti-bolt',          label: 'Workflow Automation' },
  ]},
  { group: 'Operations', items: [
    { to: '/fleet',       icon: 'ti-truck',         label: 'Fleet',       badge: '3', badgeColor: '#FCEBEB', badgeText: '#A32D2D' },
    { to: '/inspection',  icon: 'ti-clipboard-check', label: 'Inspection', badge: 'New', badgeColor: '#E1F5EE', badgeText: '#0F6E56' },
    { to: '/diagnostics', icon: 'ti-tool',          label: 'Diagnostics' },
  ]},
  { group: 'Insights', items: [
    { to: '/analytics',   icon: 'ti-chart-bar',     label: 'Analytics' },
  ]},
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [recentConvs, setRecentConvs] = useState([]);
  const location = useLocation();

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

      {/* Sidebar */}
      <aside style={{ width:210, minWidth:210, background:'#fff', borderRight:'0.5px solid #D0DCE8', display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Logo */}
        <div style={{ padding:'20px', borderBottom:'1px solid var(--lgray)', display:'flex', alignItems:'center' }}>
          <img src="/logo.png" alt="LUMI AI" style={{ height: 96, objectFit: 'contain' }} />
        </div>

        {/* Nav */}
        <nav style={{ padding:'8px 6px', flex:1, overflow:'auto' }}>
          {NAV.map(({ group, items }) => (
            <div key={group} style={{ marginBottom:4 }}>
              <div style={{ fontSize:10, color:'#90A4AE', padding:'6px 10px 2px', textTransform:'uppercase', letterSpacing:'.5px' }}>{group}</div>
              {items.map(({ to, icon, label, badge, badgeColor, badgeText }) => (
                <NavLink key={to} to={to} style={({ isActive }) => ({
                  display:'flex', alignItems:'center', gap:8, padding:'7px 10px',
                  borderRadius:8, textDecoration:'none', fontSize:12.5,
                  color: isActive ? '#1C2B3A' : '#607D8B',
                  background: isActive ? '#F5F8FC' : 'transparent',
                  fontWeight: isActive ? 500 : 400,
                })}>
                  <i className={`ti ${icon}`} style={{ fontSize:15 }} aria-hidden="true" />
                  {label}
                  {badge && (
                    <span style={{ marginLeft:'auto', background:badgeColor, color:badgeText, borderRadius:10, padding:'1px 6px', fontSize:10, fontWeight:500 }}>
                      {badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Recent conversations */}
        <div style={{ padding:'0 6px 6px' }}>
          <div style={{ fontSize:10, color:'#90A4AE', padding:'4px 10px 3px' }}>Recent</div>
          {recentConvs.map((c, i) => (
            <div key={c.id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding:'4px 10px', borderRadius:8, cursor:'pointer' }}
              onClick={() => navigate(c.id ? `/chat/${c.id}` : '/chat')}
              onMouseOver={e => e.currentTarget.style.background = '#F5F8FC'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ fontSize:11, color:'#607D8B', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', flex: 1 }}>
                {c.title || c}
              </div>
              {c.id && (
                <i className="ti ti-trash" style={{ fontSize: 13, color: '#90A4AE', padding: '2px', marginLeft: '4px' }} 
                   onClick={(e) => handleDeleteConv(e, c.id)} 
                   onMouseOver={e => e.target.style.color = '#D32F2F'}
                   onMouseOut={e => e.target.style.color = '#90A4AE'}
                   title="Delete conversation" />
              )}
            </div>
          ))}
          {recentConvs.length === 0 && (
            <div style={{ fontSize:11, color:'#90A4AE', padding:'4px 10px', fontStyle: 'italic' }}>No recent chats</div>
          )}
        </div>

        {/* User */}
        <div style={{ padding:'8px 6px', borderTop:'0.5px solid #D0DCE8' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 10px', borderRadius:8, cursor:'pointer' }}
            onClick={handleLogout}>
            <div style={{ width:28, height:28, borderRadius:'50%', background:'#E1F5EE', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:500, color:'#0F6E56', flexShrink:0 }}>
              {user?.name?.slice(0,2).toUpperCase() || 'AT'}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:12, fontWeight:500, color:'#1C2B3A', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name || 'User'}</div>
              <div style={{ fontSize:10.5, color:'#90A4AE' }}>Enterprise plan</div>
            </div>
            <i className="ti ti-logout" style={{ fontSize:13, color:'#90A4AE' }} aria-hidden="true" />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden' }}>
        <Outlet />
      </div>
    </div>
  );
}
