import { Outlet, NavLink } from 'react-router-dom';

const CONSOLE_NAV = [
  { group: '', items: [
    { to: '/console', icon: 'ti-home', label: 'Dashboard', exact: true },
    { to: '/console/api-keys', icon: 'ti-key', label: 'API Keys' },
    { to: '/console/models', icon: 'ti-box', label: 'Models' },
    { to: '/console/usage', icon: 'ti-chart-line', label: 'Usage', hasSubmenu: true },
  ]},
  { group: 'API', items: [
    { to: '/console/chat', icon: 'ti-message-circle', label: 'Chat' },
    { to: '/console/imagine', icon: 'ti-photo', label: 'Imagine' },
    { to: '/console/voice', icon: 'ti-microphone', label: 'Voice', hasSubmenu: true },
    { to: '/console/storage', icon: 'ti-server', label: 'Storage', hasSubmenu: true },
    { to: '/console/batches', icon: 'ti-stack', label: 'Batches' },
  ]},
  { group: 'Platforms', items: [
    { to: '/console/lumi-business', icon: 'ti-briefcase', label: 'LUMI Business' },
  ]},
];

export default function ConsoleShell() {
  return (
    <div style={{ display: 'flex', height: '100vh', background: '#FAFAFA', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Sidebar */}
      <aside style={{ width: '250px', background: '#FFFFFF', borderRight: '1px solid #EBEBEB', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header/Logo area */}
        <div style={{ padding: '24px 24px 12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.5px' }}>LUMI</span>
          </div>
          <i className="ti ti-search" style={{ color: '#888', fontSize: '18px', cursor: 'pointer' }} />
        </div>

        {/* Project Selector */}
        <div style={{ padding: '0 16px 16px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#F5F5F5', borderRadius: '8px', cursor: 'pointer' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '20px', height: '20px', background: '#E0E0E0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', color: '#555' }}>A</div>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>Achtrex-service</span>
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
                    <i className={item.icon} style={{ fontSize: '18px', color: '#888' }} />
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
          <NavLink to="/console/billing" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: '#555', fontSize: '14px', fontWeight: '500' }}>
             <i className="ti ti-coin" style={{ fontSize: '18px', color: '#888' }} />
             Credits
          </NavLink>
          <div style={{ display: 'flex', gap: '12px' }}>
             <NavLink to="/console/docs" style={{ color: '#888' }}>
               <i className="ti ti-book" style={{ fontSize: '18px', cursor: 'pointer' }} />
             </NavLink>
             <i className="ti ti-settings" style={{ fontSize: '18px', color: '#888', cursor: 'pointer' }} />
          </div>
        </div>

      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <Outlet />
      </main>

    </div>
  );
}
