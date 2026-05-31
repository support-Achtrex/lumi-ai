import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import APIService from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function BillingPage() {
  const { user, setUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'plans', 'invoices'
  const [planSubTab, setPlanSubTab] = useState('individual'); // 'individual', 'enterprise'
  
  const [plans, setPlans] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [usage, setUsage] = useState({ totals: { total_tokens: 0 }, daily: [] });
  
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [verifying, setVerifying] = useState(false);

  const [checkoutPlan, setCheckoutPlan] = useState(null);
  const [discountCode, setDiscountCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  async function loadData() {
    try {
      const [plansRes, invoicesRes, usageRes, meRes] = await Promise.all([
        APIService.getPlans().catch(() => []),
        APIService.getInvoices().catch(() => []),
        APIService.getUsage().catch(() => ({ totals: { total_tokens: 0 }, daily: [] })),
        APIService.get('/auth/me').catch(() => null)
      ]);
      setPlans(Array.isArray(plansRes) ? plansRes : plansRes?.data || plansRes?.plans || []);
      setInvoices(Array.isArray(invoicesRes) ? invoicesRes : invoicesRes?.data || invoicesRes?.invoices || []);
      
      if (usageRes.success && usageRes.data) {
        setUsage(usageRes.data);
      }

      if (meRes && meRes.success && meRes.user) {
        setUser(meRes.user);
        localStorage.setItem('lumi_user', JSON.stringify(meRes.user));
      }
    } catch (err) {
      console.error('Failed to load billing data', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    const queryParams = new URLSearchParams(location.search);
    const reference = queryParams.get('reference');
    if (reference) {
      setActiveTab('overview');
      verifyTransaction(reference);
    }
  }, [location]);

  async function verifyTransaction(reference) {
    setVerifying(true);
    try {
      const res = await APIService.verifyPayment(reference);
      if (res.success) {
        setMessage(`Payment successful! Upgraded to ${res.plan_type.toUpperCase()} plan.`);
        const updatedUser = { ...user, credits: Number(user.credits || 0) + Number(res.creditsAdded), plan_type: res.plan_type };
        setUser(updatedUser);
        localStorage.setItem('lumi_user', JSON.stringify(updatedUser));
        navigate('/console/billing', { replace: true });
        loadData(); // Reload invoices
      } else {
        setMessage(`Payment verification failed.`);
      }
    } catch (err) {
      setMessage(`Payment error: ${err.message}`);
    } finally {
      setVerifying(false);
    }
  }

  async function handleInitializeCheckout() {
    setIsProcessing(true);
    setMessage('');
    try {
      const res = await APIService.initializePayment(checkoutPlan.price_usd, discountCode, checkoutPlan.id);
      if (res.success && res.data?.authorization_url) {
        window.location.href = res.data.authorization_url;
      } else {
        setMessage('Failed to initialize payment.');
        setIsProcessing(false);
      }
    } catch (err) {
      setMessage(`Error initializing payment: ${err.message}`);
      setIsProcessing(false);
    }
  }

  const currentMonthName = new Date().toLocaleString('default', { month: 'long' });
  const maxTokens = Math.max(...(usage.daily || []).map(d => parseInt(d.daily_tokens)), 1);

  const PlanCard = ({ plan }) => {
    const isPopular = plan.is_popular;
    const features = Array.isArray(plan.features) ? plan.features : [];
    return (
      <div style={{ flex: 1, minWidth: 280, border: isPopular ? '2px solid #0A2085' : '1px solid #EBEBEB', borderRadius: 16, padding: 32, background: '#FFF', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        {isPopular && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#0A2085', color: '#FFF', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 12 }}>MOST POPULAR</div>}
        <h3 style={{ margin: '0 0 8px 0', fontSize: 20, color: '#1C2B3A' }}>{plan.title}</h3>
        <p style={{ margin: '0 0 24px 0', color: '#607D8B', fontSize: 14 }}>{plan.description}</p>
        <div style={{ marginBottom: 32, display: 'flex', alignItems: 'flex-end', gap: 6 }}>
          <span style={{ fontSize: 40, fontWeight: 700, color: '#1C2B3A', lineHeight: 1 }}>${parseFloat(plan.price_usd).toLocaleString()}</span>
          <span style={{ color: '#607D8B', fontSize: 14, marginBottom: 6 }}>{plan.interval}</span>
        </div>
        <button onClick={() => setCheckoutPlan(plan)} disabled={verifying} style={{ width: '100%', padding: '14px 0', background: isPopular ? '#0A2085' : '#1C2B3A', color: '#FFF', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: verifying ? 'not-allowed' : 'pointer', opacity: verifying ? 0.7 : 1, marginBottom: 32 }}>Upgrade</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#1C2B3A' }}>Everything included:</div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {features.map((f, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: '#455A64', lineHeight: 1.4 }}>
                <i className="ti ti-check" style={{ color: '#0A2085', marginTop: 2 }} /> 
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '40px', maxWidth: 1100, margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 24px 0', color: '#1C2B3A' }}>Billing</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid #EBEBEB', marginBottom: 32 }}>
        {['overview', 'plans', 'invoices'].map(t => (
          <div 
            key={t}
            onClick={() => setActiveTab(t)}
            style={{ padding: '0 0 12px 0', cursor: 'pointer', fontWeight: 600, fontSize: 15, color: activeTab === t ? '#1C2B3A' : '#888', borderBottom: activeTab === t ? '2px solid #1C2B3A' : '2px solid transparent', textTransform: 'capitalize' }}
          >
            {t}
          </div>
        ))}
      </div>

      {message && (
        <div style={{ background: message.includes('success') ? '#E1F5EE' : '#FCEBEB', color: message.includes('success') ? '#0F6E56' : '#A32D2D', padding: '16px 24px', borderRadius: 12, marginBottom: 32, fontWeight: 500 }}>
          {message}
        </div>
      )}

      {loading ? (
        <div style={{ color: '#888' }}>Loading billing data...</div>
      ) : (
        <>
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {/* Spend Management */}
              <div style={{ border: '1px solid #EBEBEB', borderRadius: 16, background: '#FFF', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', fontWeight: 700, fontSize: 16, borderBottom: '1px solid #EBEBEB' }}>Spend management</div>
                <div style={{ display: 'flex' }}>
                  <div style={{ flex: 1, padding: 32, borderRight: '1px solid #EBEBEB' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ fontWeight: 600, color: '#1C2B3A' }}>Credits</div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: '#1C2B3A' }}>{Math.floor(user.credits || 0)}</div>
                    </div>
                    <div style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>Your total credit balance, including free credits granted to your account.</div>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button onClick={() => setActiveTab('plans')} style={{ background: '#1C2B3A', color: '#FFF', border: 'none', padding: '8px 16px', borderRadius: 20, fontWeight: 600, cursor: 'pointer' }}>Add credits</button>
                    </div>
                  </div>
                  <div style={{ flex: 1, padding: 32 }}>
                    <div style={{ fontWeight: 600, color: '#1C2B3A', marginBottom: 8 }}>Active Plan</div>
                    <div style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>You are currently on the <strong style={{color:'#1C2B3A', textTransform:'capitalize'}}>{user.plan_type}</strong> tier.</div>
                    <button onClick={() => setActiveTab('plans')} style={{ background: '#1C2B3A', color: '#FFF', border: 'none', padding: '8px 16px', borderRadius: 20, fontWeight: 600, cursor: 'pointer' }}>Manage Plan</button>
                  </div>
                </div>
              </div>

              {/* API Usage */}
              <div style={{ border: '1px solid #EBEBEB', borderRadius: 16, background: '#FFF' }}>
                <div style={{ padding: '20px 24px', fontWeight: 700, fontSize: 16, borderBottom: '1px solid #EBEBEB' }}>API usage</div>
                <div style={{ padding: 32 }}>
                  <div style={{ textAlign: 'right', fontSize: 12, color: '#888', marginBottom: 16 }}>Accumulated usage ({currentMonthName})</div>
                  <div style={{ height: 160, marginBottom: 16 }}>
                    {usage.daily.length === 0 ? (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA', borderRadius: 8, color: '#CCC' }}>
                        No usage yet
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={usage.daily} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorDailyTokens" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#1C2B3A" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#1C2B3A" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: '1px solid #EBEBEB', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                            labelStyle={{ fontWeight: '600', color: '#000', marginBottom: '4px' }}
                          />
                          <Area type="monotone" dataKey="daily_tokens" stroke="#1C2B3A" strokeWidth={2} fillOpacity={1} fill="url(#colorDailyTokens)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 13, color: '#888' }}>Total API Tokens</div>
                    <div style={{ fontWeight: 600 }}>{parseInt(usage.totals?.total_tokens || 0).toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Billing details */}
              <div style={{ border: '1px solid #EBEBEB', borderRadius: 16, background: '#FFF' }}>
                <div style={{ padding: '20px 24px', fontWeight: 700, fontSize: 16, borderBottom: '1px solid #EBEBEB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  Billing details
                </div>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #EBEBEB' }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Billing email</div>
                  <div style={{ color: '#888', fontSize: 14 }}>{user.email}</div>
                </div>
              </div>

              {/* Latest Invoices */}
              <div style={{ border: '1px solid #EBEBEB', borderRadius: 16, background: '#FFF' }}>
                <div style={{ padding: '20px 24px', fontWeight: 700, fontSize: 16, borderBottom: '1px solid #EBEBEB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  Latest invoices
                  <button onClick={() => setActiveTab('invoices')} style={{ background: '#FFF', border: '1px solid #EBEBEB', padding: '6px 12px', borderRadius: 16, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>View all</button>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
                  <thead style={{ color: '#888' }}>
                    <tr>
                      <th style={{ padding: '16px 24px', fontWeight: 600 }}>Reference</th>
                      <th style={{ padding: '16px 24px', fontWeight: 600 }}>Date</th>
                      <th style={{ padding: '16px 24px', fontWeight: 600 }}>Plan</th>
                      <th style={{ padding: '16px 24px', fontWeight: 600 }}>Amount</th>
                      <th style={{ padding: '16px 24px', fontWeight: 600 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.slice(0, 3).map(inv => (
                      <tr key={inv.id} style={{ borderTop: '1px solid #EBEBEB' }}>
                        <td style={{ padding: '16px 24px', fontFamily: 'monospace' }}>{inv.reference}</td>
                        <td style={{ padding: '16px 24px', color: '#555' }}>{new Date(inv.created_at).toLocaleDateString()}</td>
                        <td style={{ padding: '16px 24px', color: '#555' }}>{inv.plan_name}</td>
                        <td style={{ padding: '16px 24px', fontWeight: 600 }}>${parseFloat(inv.amount).toFixed(2)}</td>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{ background: '#E1F5EE', color: '#0F6E56', padding: '4px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>Paid</span>
                        </td>
                      </tr>
                    ))}
                    {invoices.length === 0 && (
                      <tr style={{ borderTop: '1px solid #EBEBEB' }}>
                        <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#888' }}>No recent invoices.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* PLANS TAB */}
          {activeTab === 'plans' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <h1 style={{ fontSize: 40, fontWeight: 700, color: '#1C2B3A', marginBottom: 16 }}>Plans that grow with you</h1>
                <div style={{ display: 'inline-flex', background: '#F5F5F5', padding: 4, borderRadius: 12 }}>
                  <button onClick={() => setPlanSubTab('individual')} style={{ padding: '8px 24px', background: planSubTab === 'individual' ? '#FFF' : 'transparent', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, color: planSubTab === 'individual' ? '#1C2B3A' : '#607D8B', cursor: 'pointer', boxShadow: planSubTab === 'individual' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }}>Individual</button>
                  <button onClick={() => setPlanSubTab('enterprise')} style={{ padding: '8px 24px', background: planSubTab === 'enterprise' ? '#FFF' : 'transparent', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, color: planSubTab === 'enterprise' ? '#1C2B3A' : '#607D8B', cursor: 'pointer', boxShadow: planSubTab === 'enterprise' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }}>Team and Enterprise</button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
                {plans.filter(p => p.tab === planSubTab).map(plan => <PlanCard key={plan.id} plan={plan} />)}
                {plans.filter(p => p.tab === planSubTab).length === 0 && <div style={{ color: '#607D8B' }}>No plans available for this tier.</div>}
              </div>
            </div>
          )}

          {/* INVOICES TAB */}
          {activeTab === 'invoices' && (
            <div style={{ border: '1px solid #EBEBEB', borderRadius: 16, background: '#FFF', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', fontWeight: 700, fontSize: 16, borderBottom: '1px solid #EBEBEB' }}>
                All Invoices
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
                <thead style={{ color: '#888', background: '#FAFAFA' }}>
                  <tr>
                    <th style={{ padding: '16px 24px', fontWeight: 600 }}>Reference</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600 }}>Date</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600 }}>Plan</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600 }}>Amount</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(inv => (
                    <tr key={inv.id} style={{ borderTop: '1px solid #EBEBEB' }}>
                      <td style={{ padding: '16px 24px', fontFamily: 'monospace' }}>{inv.reference}</td>
                      <td style={{ padding: '16px 24px', color: '#555' }}>{new Date(inv.created_at).toLocaleString()}</td>
                      <td style={{ padding: '16px 24px', color: '#555' }}>{inv.plan_name}</td>
                      <td style={{ padding: '16px 24px', fontWeight: 600 }}>${parseFloat(inv.amount).toFixed(2)}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ background: '#E1F5EE', color: '#0F6E56', padding: '4px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>Paid</span>
                      </td>
                    </tr>
                  ))}
                  {invoices.length === 0 && (
                    <tr style={{ borderTop: '1px solid #EBEBEB' }}>
                      <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#888' }}>No invoices found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

        </>
      )}

      {/* Checkout Modal */}
      {checkoutPlan && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#FFF', padding: 32, borderRadius: 16, width: 400, boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
            <h2 style={{ margin: '0 0 8px 0' }}>Complete Purchase</h2>
            <div style={{ color: '#607D8B', fontSize: 14, marginBottom: 24 }}>You are upgrading to the <strong>{checkoutPlan.title}</strong> plan.</div>
            
            <div style={{ marginBottom: 24, padding: 16, background: '#F5F5F5', borderRadius: 8, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600 }}>Total</span>
              <span style={{ fontWeight: 700, fontSize: 18 }}>${checkoutPlan.price_usd}</span>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Promo Code (Optional)</label>
              <input 
                value={discountCode}
                onChange={e => setDiscountCode(e.target.value)}
                placeholder="Enter promo code"
                style={{ width: '100%', padding: 12, border: '1px solid #CCC', borderRadius: 8, fontSize: 14 }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                onClick={() => { setCheckoutPlan(null); setDiscountCode(''); }}
                disabled={isProcessing}
                style={{ flex: 1, padding: '12px', background: '#FFF', border: '1px solid #CCC', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
                Cancel
              </button>
              <button 
                onClick={handleInitializeCheckout}
                disabled={isProcessing}
                style={{ flex: 1, padding: '12px', background: '#0A2085', color: '#FFF', border: 'none', borderRadius: 8, cursor: isProcessing ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
                {isProcessing ? 'Processing...' : 'Pay Now'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
