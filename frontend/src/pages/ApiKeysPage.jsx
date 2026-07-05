import React, { useState, useEffect } from 'react';
import APIService from '../services/api';

export default function ApiKeysPage() {
  const [keys, setKeys] = useState([]);
  const [keyName, setKeyName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState('chat');

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const res = await APIService.get('/keys');
      setKeys(res.data || []);
    } catch (e) {
      console.error('Failed to fetch keys', e);
    }
  };

  const handleCreate = async () => {
    if (!keyName.trim()) return;
    try {
      await APIService.post('/keys/generate', { name: keyName });
      fetchKeys();
      setKeyName('');
      setShowModal(false);
    } catch (e) {
      console.error('Failed to create key', e);
    }
  };

  const handleDelete = async (id) => {
    try {
      await APIService.del(`/keys/${id}`); // Fixed: api.js uses APIService.del, not APIService.delete
      fetchKeys();
    } catch (e) {
      console.error('Failed to delete key', e);
    }
  };

  const handleCopy = (keyStr, id) => {
    navigator.clipboard.writeText(keyStr);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const docSnippets = {
    chat: {
      title: 'Chat API',
      endpoint: 'POST https://api.aaia.com/v1/chat/message',
      body: JSON.stringify({
        "message": "My engine is making a clicking noise.",
        "vin": "1HGCM82633A004123"
      }, null, 2),
      response: JSON.stringify({
        "success": true,
        "data": {
          "reply": "A clicking noise can indicate low engine oil or issues with the valvetrain. Please check your oil dipstick."
        }
      }, null, 2)
    },
    diagnostics: {
      title: 'Diagnostics API',
      endpoint: 'POST https://api.aaia.com/v1/diagnostics/reasoning',
      body: JSON.stringify({
        "symptoms": "engine misfire",
        "vin": "1HGCM82633A004123"
      }, null, 2),
      response: JSON.stringify({
        "success": true,
        "data": {
          "detailedSummary": "The engine misfire could be caused by worn spark plugs, a failing ignition coil, or a vacuum leak.",
          "nodes": []
        }
      }, null, 2)
    },
    parts: {
      title: 'Part Lookup API',
      endpoint: 'POST https://api.aaia.com/v1/parts/details',
      body: JSON.stringify({
        "partQuery": "Alternator",
        "vehicleInfo": {
          "year": "2014",
          "make": "Honda",
          "model": "Accord"
        }
      }, null, 2),
      response: JSON.stringify({
        "success": true,
        "data": {
          "parts": [
            {
              "title": "OEM Alternator Assembly",
              "price": "$250.00",
              "part_number": "31100-5A2-A02",
              "description": "Genuine Honda alternator assembly."
            }
          ]
        }
      }, null, 2)
    }
  };

  return (
    <div style={{ padding: '40px 48px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      
      {/* API Keys Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 8px 0', color: 'var(--dgray)' }}>API Keys</h1>
          <p style={{ margin: 0, color: 'var(--gray)', fontSize: '15px' }}>Manage your secret keys for accessing the AAIA API.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          style={{ background: 'var(--dblu)', color: '#FFF', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="ti ti-plus" /> Create new key
        </button>
      </div>

      <div style={{ background: '#FFF', border: '1px solid var(--bord)', borderRadius: '16px', overflow: 'hidden', marginBottom: '48px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#F5F8FC', borderBottom: '1px solid var(--bord)' }}>
            <tr>
              <th style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--gray)', fontWeight: '700', letterSpacing: '0.5px' }}>NAME</th>
              <th style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--gray)', fontWeight: '700', letterSpacing: '0.5px' }}>SECRET KEY</th>
              <th style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--gray)', fontWeight: '700', letterSpacing: '0.5px' }}>CREATED</th>
              <th style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--gray)', fontWeight: '700', letterSpacing: '0.5px', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k.id} style={{ borderBottom: '1px solid var(--bord)' }}>
                <td style={{ padding: '20px 24px', fontWeight: '600', color: 'var(--dgray)' }}>{k.name}</td>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#F4F7FB', padding: '8px 16px', borderRadius: '8px', width: 'fit-content' }}>
                    <span style={{ fontFamily: 'monospace', color: 'var(--dblu)', fontWeight: '600', fontSize: '14px' }}>
                      {(k.key_value || k.key).substring(0, 8)}...{(k.key_value || k.key).substring((k.key_value || k.key).length - 4)}
                    </span>
                    <button 
                      onClick={() => handleCopy(k.key_value || k.key, k.id)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: copiedId === k.id ? '#10B981' : 'var(--gray)', padding: 0, display: 'flex' }}
                      title="Copy full key">
                      <i className={copiedId === k.id ? "ti ti-check" : "ti ti-copy"} style={{ fontSize: '16px' }} />
                    </button>
                  </div>
                </td>
                <td style={{ padding: '20px 24px', color: 'var(--gray)', fontSize: '14px', fontWeight: '500' }}>
                  {new Date(k.created_at || k.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '20px 24px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => handleDelete(k.id)} style={{ background: '#FEE2E2', color: '#EF4444', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className="ti ti-trash" /> Delete
                  </button>
                </td>
              </tr>
            ))}
            {keys.length === 0 && (
              <tr>
                <td colSpan="4" style={{ padding: '48px', textAlign: 'center', color: 'var(--gray)' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px', color: '#E2E8F0' }}><i className="ti ti-key" /></div>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--dgray)', marginBottom: '8px' }}>No API keys found</div>
                  <div style={{ fontSize: '15px' }}>Create an API key to authenticate your requests.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Documentation Section */}
      <div style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 24px 0', color: 'var(--dgray)' }}>API Documentation</h2>
        <div style={{ display: 'flex', gap: '24px' }}>
          
          {/* Tabs */}
          <div style={{ width: '240px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.keys(docSnippets).map(key => (
              <button
                key={key}
                onClick={() => setSelectedDoc(key)}
                style={{
                  padding: '16px 20px', textAlign: 'left', background: selectedDoc === key ? 'var(--dblu)' : '#fff',
                  color: selectedDoc === key ? '#fff' : 'var(--gray)', border: '1px solid',
                  borderColor: selectedDoc === key ? 'var(--dblu)' : 'var(--bord)',
                  borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer',
                  transition: 'all 0.2s', boxShadow: selectedDoc === key ? '0 8px 20px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                {docSnippets[key].title}
              </button>
            ))}
          </div>

          {/* Snippet Display */}
          <div style={{ flex: 1, background: '#1E293B', borderRadius: '16px', padding: '24px', overflow: 'hidden', color: '#F8FAFC', boxShadow: '0 12px 32px rgba(0,0,0,0.15)' }}>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#94A3B8', marginBottom: '8px', letterSpacing: '0.5px' }}>ENDPOINT</div>
              <div style={{ background: '#0F172A', padding: '12px 16px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '14px', color: '#38BDF8' }}>
                {docSnippets[selectedDoc].endpoint}
              </div>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#94A3B8', marginBottom: '8px', letterSpacing: '0.5px' }}>HEADERS</div>
              <div style={{ background: '#0F172A', padding: '12px 16px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '14px', color: '#F472B6' }}>
                Authorization: Bearer YOUR_API_KEY<br/>
                Content-Type: application/json
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#94A3B8', marginBottom: '8px', letterSpacing: '0.5px' }}>REQUEST BODY</div>
                <pre style={{ margin: 0, background: '#0F172A', padding: '16px', borderRadius: '8px', fontSize: '13px', overflowX: 'auto', color: '#A7F3D0' }}>
                  {docSnippets[selectedDoc].body}
                </pre>
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#94A3B8', marginBottom: '8px', letterSpacing: '0.5px' }}>RESPONSE</div>
                <pre style={{ margin: 0, background: '#0F172A', padding: '16px', borderRadius: '8px', fontSize: '13px', overflowX: 'auto', color: '#FDE047' }}>
                  {docSnippets[selectedDoc].response}
                </pre>
              </div>
            </div>
          </div>

        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.2s' }}>
          <div style={{ background: '#FFF', padding: '32px', borderRadius: '24px', width: '400px', boxShadow: '0 24px 60px rgba(0,0,0,0.1)' }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '800', color: 'var(--dgray)' }}>Create API Key</h2>
            <p style={{ margin: '0 0 24px 0', color: 'var(--gray)', fontSize: '15px' }}>Give your new key a descriptive name to help you identify it later.</p>
            <input 
              autoFocus
              placeholder="e.g., Production App" 
              value={keyName}
              onChange={e => setKeyName(e.target.value)}
              style={{ width: '100%', padding: '16px', border: '2px solid #E2E8F0', borderRadius: '12px', marginBottom: '32px', fontSize: '16px', outline: 'none' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '12px 24px', background: '#F5F8FC', color: 'var(--gray)', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '15px' }}>Cancel</button>
              <button onClick={handleCreate} style={{ padding: '12px 24px', background: 'var(--dblu)', color: '#FFF', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '15px' }}>Create Key</button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
