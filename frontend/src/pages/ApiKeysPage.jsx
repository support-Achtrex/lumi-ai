import { useState, useEffect } from 'react';
import APIService from '../services/api';

export default function ApiKeysPage() {
  const [keys, setKeys] = useState([]);
  const [keyName, setKeyName] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const { data } = await APIService.get('/keys');
      setKeys(data);
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
      await APIService.delete(`/keys/${id}`);
      fetchKeys();
    } catch (e) {
      console.error('Failed to delete key', e);
    }
  };

  return (
    <div style={{ padding: '40px 48px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>API Keys</h1>
        <button 
          onClick={() => setShowModal(true)}
          style={{ background: '#000', color: '#FFF', border: 'none', padding: '10px 20px', borderRadius: '24px', fontWeight: '600', cursor: 'pointer' }}>
          Create new key
        </button>
      </div>

      <div style={{ background: '#FFF', border: '1px solid #EBEBEB', borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#FAFAFA', borderBottom: '1px solid #EBEBEB' }}>
            <tr>
              <th style={{ padding: '16px 24px', fontSize: '13px', color: '#555', fontWeight: '600' }}>NAME</th>
              <th style={{ padding: '16px 24px', fontSize: '13px', color: '#555', fontWeight: '600' }}>KEY</th>
              <th style={{ padding: '16px 24px', fontSize: '13px', color: '#555', fontWeight: '600' }}>CREATED</th>
              <th style={{ padding: '16px 24px', fontSize: '13px', color: '#555', fontWeight: '600' }}></th>
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k.id} style={{ borderBottom: '1px solid #EBEBEB' }}>
                <td style={{ padding: '16px 24px', fontWeight: '500' }}>{k.name}</td>
                <td style={{ padding: '16px 24px', fontFamily: 'monospace', color: '#666' }}>
                  {(k.key_value || k.key).substring(0, 8)}...{(k.key_value || k.key).substring((k.key_value || k.key).length - 4)}
                </td>
                <td style={{ padding: '16px 24px', color: '#888', fontSize: '14px' }}>
                  {new Date(k.created_at || k.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <i className="ti ti-trash" style={{ cursor: 'pointer', color: '#E53935' }} onClick={() => handleDelete(k.id)} />
                </td>
              </tr>
            ))}
            {keys.length === 0 && (
              <tr>
                <td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: '#888' }}>
                  No API keys found. Create one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#FFF', padding: '32px', borderRadius: '16px', width: '400px' }}>
            <h2 style={{ margin: '0 0 16px 0' }}>Create API Key</h2>
            <input 
              autoFocus
              placeholder="Key Name (e.g., Production)" 
              value={keyName}
              onChange={e => setKeyName(e.target.value)}
              style={{ width: '100%', padding: '12px', border: '1px solid #CCC', borderRadius: '8px', marginBottom: '24px', fontSize: '16px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '10px 20px', background: '#FFF', border: '1px solid #CCC', borderRadius: '24px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
              <button onClick={handleCreate} style={{ padding: '10px 20px', background: '#000', color: '#FFF', border: 'none', borderRadius: '24px', cursor: 'pointer', fontWeight: '600' }}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
