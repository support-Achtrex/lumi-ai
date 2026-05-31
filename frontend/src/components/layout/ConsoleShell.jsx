import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';

const CONSOLE_NAV = [
  { group: 'Analytics', items: [
    { to: '/console/dashboard', icon: 'ti-chart-area-line', label: 'Dashboard' },
  ]},
  { group: 'Account', items: [
    { to: '/console/profile', icon: 'ti-user', label: 'Profile Settings' },
  ]},
  { group: 'Organization', items: [
    { to: '/console/billing', icon: 'ti-coin', label: 'Billing & Plan' },
  ]},
  { group: 'Developer', items: [
    { to: '/console/api-keys', icon: 'ti-key', label: 'API Keys' },

    { to: '/console/docs', icon: 'ti-book', label: 'Documentation' },
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
            <img src="/logo.png" alt="LUMI" style={{ height: '28px', objectFit: 'contain' }} />
          </div>
          <i className="ti ti-search" style={{ color: '#888', fontSize: '18px', cursor: 'pointer' }} />
        </div>

        {/* Project Selector */}
        <div style={{ padding: '0 16px 16px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#F5F5F5', borderRadius: '8px', cursor: 'pointer' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '20px', height: '20px', background: '#1C2B3A', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', color: '#fff' }}>
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#1C2B3A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name || 'Account'}
                </span>
             </div>
             <i className="ti ti-selector" style={{ color: '#888', fontSize: '14px' }} />
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '0 12px' }}>
          {CONSOLE_NAV.map((section, idx) => (
            <div key={idx} style={{ marginBottom: '16px' }}>
              {section.group && (
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#888', textTransform: 'uppercase', padding: '8px 12px', letterSpacing: '0.5px' }}>
                  {section.group}
                </div>
              )}
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: isActive ? '#000' : '#555',
                    background: isActive ? '#F5F5F5' : 'transparent',
                    fontWeight: isActive ? '600' : '400',
                    fontSize: '14px',
                    marginBottom: '2px'
                  })}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <i className={`ti ${item.icon}`} style={{ fontSize: '18px', color: '#888' }} />
                    {item.label}
                  </div>
                  {item.hasSubmenu && <i className="ti ti-chevron-down" style={{ fontSize: '14px', color: '#AAA' }} />}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div style={{ padding: '16px', borderTop: '1px solid #EBEBEB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <NavLink to="/chat" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: '#555', fontSize: '13px', fontWeight: '500' }}>
             <i className="ti ti-arrow-left" style={{ fontSize: '16px', color: '#888' }} />
             Back to App
          </NavLink>
          <div style={{ display: 'flex', gap: '12px' }}>
             <i className="ti ti-logout" title="Log out" style={{ fontSize: '18px', color: '#888', cursor: 'pointer' }} onClick={handleLogout} />
          </div>
        </div>

      </aside>

      {/* Main Content */}
      <main className="main-content-area" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Mobile Header Toggle */}
        {isMobile && (
          <div style={{ padding: '16px', background: '#fff', borderBottom: '1px solid #D0DCE8', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'transparent', border: 'none', color: '#1C2B3A', padding: '4px' }}>
              <i className="ti ti-menu-2" style={{ fontSize: 24 }} />
            </button>
            <span style={{ fontWeight: 600, fontSize: 16 }}>Console</span>
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
}
