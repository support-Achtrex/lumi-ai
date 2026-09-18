// src/components/layout/ConsoleShell.jsx
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  User,
  CreditCard,
  Key,
  BookOpen,
  Search,
  ChevronsUpDown,
  ChevronDown,
  ArrowLeft,
  LogOut,
  Menu,
  Shield
} from 'lucide-react';

const CONSOLE_NAV = [
  { group: 'Analytics', items: [
    { to: '/console/dashboard', Icon: LayoutDashboard, label: 'Dashboard' },
  ]},
  { group: 'Account', items: [
    { to: '/console/profile', Icon: User, label: 'Profile Settings' },
  ]},
  { group: 'Organization', items: [
    { to: '/console/billing', Icon: CreditCard, label: 'Billing & Plan' },
  ]},
  { group: 'Developer', items: [
    { to: '/console/api-keys', Icon: Key, label: 'API Keys' },
    { to: '/console/docs', Icon: BookOpen, label: 'Documentation' },
  ]},
  { group: 'Administration', role: 'admin', items: [
    { to: '/admin/dashboard', Icon: Shield, label: 'Admin Control Center' },
  ]},
];

export default function ConsoleShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

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
    if (isMobile) setIsSidebarOpen(false);
  }, [location.pathname]);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#FAFAFA', fontFamily: 'Inter, sans-serif' }}>
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
        style={{ width: '250px', background: '#FFFFFF', borderRight: '1px solid #EBEBEB', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s ease-in-out' }}
      >
        
        {/* Header/Logo area */}
        <div style={{ padding: '24px 24px 12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/logo.png" alt="AAIA" style={{ height: '28px', objectFit: 'contain' }} />
          </div>
          <Search size={18} style={{ color: '#888', cursor: 'pointer' }} />
        </div>

        {/* Project Selector */}
        <div style={{ padding: '0 16px 16px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#F5F5F5', borderRadius: '8px', cursor: 'pointer' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '22px', height: '22px', background: '#0A2085', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', color: '#fff' }}>
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <span style={{ fontSize: '13.5px', fontWeight: '600', color: '#1C2B3A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name || 'Account'}
                </span>
             </div>
             <ChevronsUpDown size={14} style={{ color: '#888' }} />
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '0 12px' }}>
          {CONSOLE_NAV.map((section, idx) => {
            if (section.role && user?.role !== section.role) return null;
            return (
              <div key={idx} style={{ marginBottom: '16px' }}>
                {section.group && (
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#888', textTransform: 'uppercase', padding: '8px 12px', letterSpacing: '0.5px' }}>
                    {section.group}
                  </div>
                )}
                {section.items.map((item) => {
                  const Icon = item.Icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.exact}
                      style={({ isActive }) => ({
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        color: isActive ? '#0A2085' : '#555',
                        background: isActive ? '#F0F5FF' : 'transparent',
                        fontWeight: isActive ? '600' : '400',
                        fontSize: '13.5px',
                        marginBottom: '2px',
                        transition: 'all 0.15s ease'
                      })}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Icon size={16} strokeWidth={2} style={{ color: '#607D8B' }} />
                        <span>{item.label}</span>
                      </div>
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div style={{ padding: '16px', borderTop: '1px solid #EBEBEB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <NavLink to="/chat" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: '#555', fontSize: '13px', fontWeight: '500' }}>
             <ArrowLeft size={16} style={{ color: '#888' }} />
             Back to App
          </NavLink>
          <button onClick={handleLogout} title="Log out" style={{ background: 'transparent', border: 'none', padding: 4, cursor: 'pointer', color: '#888', display: 'flex', alignItems: 'center', minHeight: 'unset' }}
            onMouseOver={e => e.currentTarget.style.color = '#D32F2F'}
            onMouseOut={e => e.currentTarget.style.color = '#888'}>
             <LogOut size={16} />
          </button>
        </div>

      </aside>

      {/* Main Content */}
      <main className="main-content-area" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Mobile Header Toggle */}
        {isMobile && (
          <div style={{ padding: '16px', background: '#fff', borderBottom: '1px solid #D0DCE8', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'transparent', border: 'none', color: '#1C2B3A', padding: '4px' }}>
              <Menu size={24} />
            </button>
            <span style={{ fontWeight: 600, fontSize: 16 }}>Console</span>
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
}
