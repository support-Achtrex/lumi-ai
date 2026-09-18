// src/pages/admin/AdminDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import APIService from '../../services/api';
import {
  Users,
  Store,
  CalendarCheck2,
  CreditCard,
  DollarSign,
  Activity,
  UserPlus,
  Tag,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Server,
  Zap,
  RefreshCw
} from 'lucide-react';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  async function loadDashboardStats() {
    try {
      setLoading(true);
      setError(null);
      const data = await APIService.getAdminStats();
      setStats(data || {});
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
      setError(err.message || 'Unable to retrieve administrative metrics.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#E0F2FE', color: '#0369A1', padding: '4px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 700, marginBottom: 6 }}>
            <ShieldCheck size={14} /> Master Administration Overview
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.5px' }}>
            System Command Center
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={loadDashboardStats}
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
            onClick={() => navigate('/admin/users')}
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
            <UserPlus size={15} />
            <span>Manage Users</span>
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '14px 18px', color: '#B91C1C', marginBottom: 24, fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18, marginBottom: 32 }}>
        <KpiCard
          title="Total Registered Users"
          value={stats?.totalUsers ?? (loading ? '…' : 0)}
          subtitle={`${stats?.activeUsers ?? 0} active accounts`}
          icon={Users}
          color="#2563EB"
          onClick={() => navigate('/admin/users')}
        />

        <KpiCard
          title="Partner Network Shops"
          value={stats?.totalGarages ?? (loading ? '…' : 0)}
          subtitle={`${stats?.activeVans ?? 0} mobile mechanic vans`}
          icon={Store}
          color="#0D9488"
          onClick={() => navigate('/admin/garages')}
        />

        <KpiCard
          title="Live Service Bookings"
          value={stats?.totalBookings ?? (loading ? '…' : 0)}
          subtitle={`${stats?.pendingBookings ?? 0} pending dispatch`}
          icon={CalendarCheck2}
          color="#EA580C"
          onClick={() => navigate('/admin/bookings')}
        />

        <KpiCard
          title="System Health"
          value="100%"
          subtitle="All microservices operational"
          icon={Activity}
          color="#16A34A"
          onClick={() => navigate('/admin/system')}
        />
      </div>

      {/* Quick Action Hub */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: '#1E293B', marginBottom: 14 }}>
          Administrative Quick Actions
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <ActionCard
            title="Create User Account"
            desc="Add a new customer, enterprise or admin"
            icon={UserPlus}
            color="#2563EB"
            onClick={() => navigate('/admin/users')}
          />
          <ActionCard
            title="Onboard Partner Shop"
            desc="Register a garage or mobile mechanic"
            icon={Store}
            color="#0D9488"
            onClick={() => navigate('/admin/garages')}
          />
          <ActionCard
            title="Dispatch & Bookings"
            desc="Review service appointment queue"
            icon={CalendarCheck2}
            color="#EA580C"
            onClick={() => navigate('/admin/bookings')}
          />
          <ActionCard
            title="Issue Discount Code"
            desc="Create promotional coupons & deals"
            icon={Tag}
            color="#7C3AED"
            onClick={() => navigate('/admin/discounts')}
          />
          <ActionCard
            title="System Diagnostics"
            desc="Inspect PostgreSQL & Redis latency"
            icon={Server}
            color="#059669"
            onClick={() => navigate('/admin/system')}
          />
        </div>
      </div>

      {/* Two Column Layout: Recent Users & Role Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
        {/* Recent Registered Users */}
        <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', padding: 22, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#1E293B', margin: 0 }}>
              Recent Registrations
            </h3>
            <button
              onClick={() => navigate('/admin/users')}
              style={{ background: 'transparent', border: 'none', color: '#2563EB', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              View All <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {stats?.recentUsers?.map((u, i) => (
              <div key={u.id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#475569', flexShrink: 0 }}>
                    {u.name?.slice(0, 1).toUpperCase() || 'U'}
                  </div>
                  <div style={{ minWidth: 0, overflow: 'hidden' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.name || 'User'}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.email}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', padding: '2px 7px', borderRadius: 5, background: u.role === 'admin' ? '#EFF6FF' : '#F1F5F9', color: u.role === 'admin' ? '#2563EB' : '#475569' }}>
                    {u.role || 'user'}
                  </span>
                </div>
              </div>
            ))}

            {(!stats?.recentUsers || stats.recentUsers.length === 0) && (
              <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', padding: 20 }}>
                {loading ? 'Loading registered users…' : 'No user records found.'}
              </div>
            )}
          </div>
        </div>

        {/* User Distribution & Tier Stats */}
        <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', padding: 22, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: '#1E293B', margin: '0 0 16px 0' }}>
            Account Distribution
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                <span>Regular Users</span>
                <span>{stats?.roleCounts?.user ?? 0}</span>
              </div>
              <ProgressBar percentage={stats?.totalUsers ? ((stats.roleCounts?.user || 0) / stats.totalUsers) * 100 : 0} color="#2563EB" />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                <span>Enterprise Accounts</span>
                <span>{stats?.roleCounts?.enterprise ?? 0}</span>
              </div>
              <ProgressBar percentage={stats?.totalUsers ? ((stats.roleCounts?.enterprise || 0) / stats.totalUsers) * 100 : 0} color="#7C3AED" />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                <span>Developer Accounts</span>
                <span>{stats?.roleCounts?.developer ?? 0}</span>
              </div>
              <ProgressBar percentage={stats?.totalUsers ? ((stats.roleCounts?.developer || 0) / stats.totalUsers) * 100 : 0} color="#0D9488" />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                <span>System Administrators</span>
                <span>{stats?.roleCounts?.admin ?? 0}</span>
              </div>
              <ProgressBar percentage={stats?.totalUsers ? ((stats.roleCounts?.admin || 0) / stats.totalUsers) * 100 : 0} color="#DC2626" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, subtitle, icon: Icon, color, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#FFFFFF',
        borderRadius: 16,
        padding: '20px 22px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        cursor: 'pointer',
        transition: 'all 0.15s ease'
      }}
      onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = color; }}
      onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
          {title}
        </div>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}15`, color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={19} />
        </div>
      </div>

      <div style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px', marginBottom: 4 }}>
        {value}
      </div>

      <div style={{ fontSize: 12, color: '#64748B' }}>
        {subtitle}
      </div>
    </div>
  );
}

function ActionCard({ title, desc, icon: Icon, color, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#FFFFFF',
        borderRadius: 12,
        padding: '14px 16px',
        border: '1px solid #E2E8F0',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        transition: 'all 0.15s ease'
      }}
      onMouseOver={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = color; }}
      onMouseOut={e => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
    >
      <div style={{ width: 36, height: 36, borderRadius: 9, background: `${color}15`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={18} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {title}
        </div>
        <div style={{ fontSize: 11, color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {desc}
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ percentage, color }) {
  const clamp = Math.min(Math.max(percentage, 0), 100);
  return (
    <div style={{ height: 7, width: '100%', background: '#F1F5F9', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${clamp}%`, background: color, borderRadius: 10, transition: 'width 0.3s ease' }} />
    </div>
  );
}
