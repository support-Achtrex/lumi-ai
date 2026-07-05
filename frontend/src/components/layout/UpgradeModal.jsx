import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function UpgradeModal({ onClose }) {
  const navigate = useNavigate();

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(28, 43, 58, 0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 99999, padding: 24, animation: 'fade-in 0.2s ease-out'
    }}>
      <div style={{
        background: '#FFF', borderRadius: 24, padding: 48, maxWidth: 500, width: '100%',
        boxShadow: '0 24px 48px rgba(0,0,0,0.2)', textAlign: 'center',
        position: 'relative'
      }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: 20, right: 20, background: 'transparent', border: 'none', cursor: 'pointer', color: '#888' }}>
          <i className="ti ti-x" style={{ fontSize: 24 }} />
        </button>

        <div style={{ width: 80, height: 80, background: '#F5F8FC', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#0A2085' }}>
          <i className="ti ti-diamond" style={{ fontSize: 40 }} />
        </div>

        <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1C2B3A', marginBottom: 16 }}>You've reached your limit</h2>
        <p style={{ fontSize: 16, color: '#607D8B', marginBottom: 32, lineHeight: 1.5 }}>
          You have exhausted your available AAIA credits. Upgrade to a premium plan to continue using advanced intelligence, deep diagnostics, and automation tools.
        </p>

        <button 
          onClick={() => {
            onClose();
            navigate('/console/billing');
          }}
          style={{ width: '100%', padding: '16px', background: '#0A2085', color: '#FFF', fontSize: 16, fontWeight: 700, border: 'none', borderRadius: 12, cursor: 'pointer', marginBottom: 12 }}
        >
          View Upgrade Plans
        </button>
        <button 
          onClick={onClose}
          style={{ width: '100%', padding: '16px', background: 'transparent', color: '#607D8B', fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer' }}
        >
          Maybe Later
        </button>
      </div>
    </div>
  );
}
