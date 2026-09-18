import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, X, ArrowRight } from 'lucide-react';

export default function UpgradeModal({ onClose }) {
  const navigate = useNavigate();

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(28, 43, 58, 0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 99999, padding: 24, animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: '#FFF', borderRadius: 24, padding: 40, maxWidth: 480, width: '100%',
        boxShadow: '0 24px 48px rgba(0,0,0,0.2)', textAlign: 'center',
        position: 'relative', border: '1px solid #EBF1F8'
      }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: 20, right: 20, background: 'transparent', border: 'none', cursor: 'pointer', color: '#888', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'unset' }}>
          <X size={20} />
        </button>

        <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg, #00E5C1, #0A2085)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#fff', boxShadow: '0 8px 24px rgba(10,32,133,0.25)' }}>
          <Sparkles size={32} />
        </div>

        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1C2B3A', marginBottom: 12 }}>You've reached your limit</h2>
        <p style={{ fontSize: 14.5, color: '#607D8B', marginBottom: 28, lineHeight: 1.5 }}>
          You have exhausted your available AAIA credits. Upgrade to a premium plan to continue using advanced reasoning, diagnostics, and automotive APIs.
        </p>

        <button 
          onClick={() => {
            onClose();
            navigate('/console/billing');
          }}
          style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #0A2085, #1E40AF)', color: '#FFF', fontSize: 15, fontWeight: 600, border: 'none', borderRadius: 12, cursor: 'pointer', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 12px rgba(10,32,133,0.2)' }}
        >
          View Upgrade Plans <ArrowRight size={16} />
        </button>
        <button 
          onClick={onClose}
          style={{ width: '100%', padding: '12px', background: 'transparent', color: '#607D8B', fontSize: 14, fontWeight: 500, border: 'none', cursor: 'pointer' }}
        >
          Maybe Later
        </button>
      </div>
    </div>
  );
}
