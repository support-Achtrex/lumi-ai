import { useState } from 'react';

export default function BillingPage() {
  const [balance, setBalance] = useState(9.72);

  return (
    <div style={{ padding: '40px 48px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '32px' }}>Billing & Credits</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={{ background: '#FFF', border: '1px solid #EBEBEB', borderRadius: '16px', padding: '32px' }}>
          <h2 style={{ margin: '0 0 24px 0', fontSize: '16px', color: '#555' }}>Current Balance</h2>
          <div style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>
            ${balance.toFixed(2)}
          </div>
          <button 
            onClick={() => setBalance(b => b + 10)}
            style={{ background: '#000', color: '#FFF', border: 'none', padding: '12px 24px', borderRadius: '24px', fontWeight: '600', cursor: 'pointer' }}>
            Add $10 Credits
          </button>
        </div>

        <div style={{ background: '#FFF', border: '1px solid #EBEBEB', borderRadius: '16px', padding: '32px' }}>
          <h2 style={{ margin: '0 0 24px 0', fontSize: '16px', color: '#555' }}>Payment Methods</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', border: '1px solid #EBEBEB', borderRadius: '8px' }}>
            <i className="ti ti-credit-card" style={{ fontSize: '24px', color: '#555' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '600' }}>Visa ending in 4242</div>
              <div style={{ fontSize: '12px', color: '#888' }}>Expires 12/28</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
