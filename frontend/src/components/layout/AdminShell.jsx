// src/components/layout/AdminShell.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminErrorBoundary from '../admin/AdminErrorBoundary';
import {
  LayoutDashboard,
  Users,
  Store,
  CalendarCheck2,
  CreditCard,
  Tag,
  Activity,
  Shield,
  ArrowUpRight,
  LogOut,
  Menu,
  X,
  Search,
  ExternalLink,
  Code2,
  MessageSquare,
  Sparkles
} from 'lucide-react';

const ADMIN_NAV = [
  {
    group: 'Control Center',
    items: [
      { to: '/admin/dashboard', Icon: LayoutDashboard, label: 'Overview' },
      { to: '/admin/users',     Icon: Users,           label: 'Users & Roles' },
      { to: '/admin/garages',   Icon: Store,           label: 'Partner Garages & Vans' },
      { to: '/admin/bookings',  Icon: CalendarCheck2,  label: 'Bookings & Dispatch' },
    ]
  },
  {
    group: 'Monetization & Plans',
    items: [
      { to: '/admin/plans',     Icon: CreditCard,      label: 'Pricing Plans' },
      { to: '/admin/discounts', Icon: Tag,             label: 'Promos & Discounts' },
    ]
  },
  {
    group: 'System & Health',
    items: [
      { to: '/admin/system',    Icon: Activity,        label: 'System Diagnostics' },
    ]
  }
];

export default function AdminShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 900);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 900;
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
    <div style={{ display: 'flex', height: '100vh', background: '#F8FAFC', fontFamily: "'Inter', system-ui, sans-serif", overflow: 'hidden' }}>
      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 990
          }}
        />
      )}

      {/* Admin Sidebar */}
      <aside
        style={{
          width: isSidebarOpen ? 260 : (isMobile ? 0 : 76),
          minWidth: isSidebarOpen ? 260 : (isMobile ? 0 : 76),
          background: '#0F172A',
          color: '#E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 999,
          position: isMobile ? 'fixed' : 'relative',
          height: '100vh',
          left: 0,
          top: 0,
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          borderRight: '1px solid #1E293B',
          boxShadow: isMobile && isSidebarOpen ? '0 20px 25px -5px rgba(0,0,0,0.5)' : 'none'
        }}
      >
        {/* Admin Header / Logo */}
        <div style={{ padding: '20px 18px', borderBottom: '1px solid #1E293B', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #2563EB, #0284C7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              flexShrink: 0
            }}>
              <Shield size={18} />
            </div>
            {isSidebarOpen && (
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: 14.5, fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>
                  AAIA Admin
                </div>
                <div style={{ fontSize: 10.5, color: '#38BDF8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  Master Control
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isMobile && isSidebarOpen ? <X size={20} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: '16px 10px', overflowY: 'auto', overflowX: 'hidden' }}>
          {ADMIN_NAV.map((section, idx) => (
            <div key={idx} style={{ marginBottom: 18 }}>
              {isSidebarOpen && (
                <div style={{ fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '0 10px 6px 10px' }}>
                  {section.group}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {section.items.map(({ to, Icon, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '9px 12px',
                      borderRadius: 9,
                      textDecoration: 'none',
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? '#FFFFFF' : '#94A3B8',
                      background: isActive ? 'rgba(37, 99, 235, 0.2)' : 'transparent',
                      borderLeft: isActive ? '3px solid #38BDF8' : '3px solid transparent',
                      transition: 'all 0.15s ease',
                      whiteSpace: 'nowrap'
                    })}
                  >
                    <Icon size={17} style={{ flexShrink: 0 }} />
                    {isSidebarOpen && <span>{label}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}

          {/* Quick Cross-Portal Switcher */}
          {isSidebarOpen && (
            <div style={{ marginTop: 24, padding: '0 4px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '0 6px 8px' }}>
                External Switch
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <button
                  onClick={() => navigate('/chat')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    background: '#1E293B',
                    color: '#CBD5E1',
                    border: '1px solid #334155',
                    borderRadius: 8,
                    padding: '8px 10px',
                    fontSize: 12,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MessageSquare size={14} color="#38BDF8" />
                    <span>User Workspace</span>
                  </div>
                  <ArrowUpRight size={13} color="#64748B" />
                </button>

                <button
                  onClick={() => navigate('/console')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    background: '#1E293B',
                    color: '#CBD5E1',
                    border: '1px solid #334155',
                    borderRadius: 8,
                    padding: '8px 10px',
                    fontSize: 12,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Code2 size={14} color="#A78BFA" />
                    <span>Developer Console</span>
                  </div>
                  <ArrowUpRight size={13} color="#64748B" />
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* Admin User Info & Logout */}
        <div style={{ padding: '12px', borderTop: '1px solid #1E293B', background: '#0B1120' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', borderRadius: 8 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#2563EB',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
              flexShrink: 0
            }}>
              {user?.name?.slice(0, 2).toUpperCase() || 'AD'}
            </div>
            {isSidebarOpen && (
              <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#F1F5F9', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {user?.name || 'Administrator'}
                </div>
                <div style={{ fontSize: 11, color: '#38BDF8', fontWeight: 600 }}>
                  Master Admin
                </div>
              </div>
            )}
            {isSidebarOpen && (
              <button
                onClick={handleLogout}
                title="Log out"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: 6,
                  borderRadius: 6
                }}
                onMouseOver={e => e.currentTarget.style.color = '#EF4444'}
                onMouseOut={e => e.currentTarget.style.color = '#94A3B8'}
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Admin Content Viewport */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', minWidth: 0 }}>
        {/* Top Header Bar */}
        <header style={{
          height: 60,
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          flexShrink: 0,
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {isMobile && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                style={{
                  background: '#F1F5F9',
                  border: '1px solid #E2E8F0',
                  borderRadius: 8,
                  padding: '6px 8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#1E293B'
                }}
              >
                <Menu size={18} />
              </button>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, background: '#EFF6FF', color: '#1D4ED8', padding: '3px 10px', borderRadius: 20 }}>
                ● AAIA Live Cluster
              </span>
              <span style={{ fontSize: 13, color: '#64748B', display: isMobile ? 'none' : 'inline' }}>
                Independent Admin Suite
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#0F766E', background: '#F0FDFA', padding: '4px 10px', borderRadius: 8, border: '1px solid #CCFBF1' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#0D9488' }} />
              <strong>Production Active</strong>
            </div>

            <button
              onClick={() => navigate('/chat')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: '#0F172A',
                color: '#FFFFFF',
                border: 'none',
                padding: '7px 13px',
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <span>User App</span>
              <ArrowUpRight size={13} />
            </button>
          </div>
        </header>

        {/* Routed Sub-pages */}
        <div style={{ flex: 1, overflowY: 'auto', background: '#F8FAFC' }}>
          <AdminErrorBoundary>
            <Outlet />
          </AdminErrorBoundary>
        </div>
      </main>
    </div>
  );
}
