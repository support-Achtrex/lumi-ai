import { Link, useLocation } from 'react-router-dom';
import { Search, Edit, Image as ImageIcon, Plus, User, LayoutDashboard, Car } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside style={{ width: '260px', background: 'var(--bg-dark)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', padding: '1.5rem 0' }}>
      <div style={{ padding: '0 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #00d2ff 0%, #8a2be2 100%)', height: '24px', width: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', gap: '2px' }}>
            <div style={{ width: '3px', height: '3px', background: 'white', borderRadius: '50%' }} />
            <div style={{ width: '3px', height: '3px', background: 'white', borderRadius: '50%' }} />
            <div style={{ width: '3px', height: '3px', background: 'white', borderRadius: '50%' }} />
          </div>
        </div>
      </div>

      <nav style={{ padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <Link to="/search" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 1rem', color: 'var(--text-main)', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem', borderRadius: '8px' }}>
          <Search size={18} /> Search
        </Link>
        <Link to="/chat" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 1rem', background: location.pathname === '/chat' || location.pathname === '/' ? 'var(--bg-panel-hover)' : 'transparent', color: 'var(--text-main)', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem', borderRadius: '12px' }}>
          <Edit size={18} /> New Chat
        </Link>
        <Link to="/imagine" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 1rem', color: 'var(--text-main)', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem', borderRadius: '8px' }}>
          <ImageIcon size={18} /> Imagine
        </Link>
        <Link to="/fleet" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 1rem', background: location.pathname === '/fleet' ? 'var(--bg-panel-hover)' : 'transparent', color: 'var(--text-main)', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem', borderRadius: '8px' }}>
          <LayoutDashboard size={18} /> Fleet Dashboard
        </Link>
        <Link to="/vin" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 1rem', background: location.pathname === '/vin' ? 'var(--bg-panel-hover)' : 'transparent', color: 'var(--text-main)', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem', borderRadius: '8px' }}>
          <Car size={18} /> VIN Lookup
        </Link>
      </nav>

      <div style={{ marginTop: '2rem', padding: '0 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem', color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Projects 
          <span style={{ cursor: 'pointer' }}>v</span>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem', width: '100%', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer', borderRadius: '8px' }}>
          <Plus size={16} /> New Project
        </button>
      </div>

      <div style={{ marginTop: '2rem', padding: '0 1rem', flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem', color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          History 
          <span style={{ cursor: 'pointer' }}>v</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer' }}>Battery Diagnostics 1HGC...</div>
          <div style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer', marginTop: '0.5rem' }}>See all</div>
        </div>
      </div>

      <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0 1rem' }}>
        <div style={{ width: '32px', height: '32px', background: 'var(--bg-panel-hover)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <User size={16} color="var(--text-muted)" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Enterprise User</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>user@achtrex.com</span>
        </div>
      </div>
    </aside>
  );
}
