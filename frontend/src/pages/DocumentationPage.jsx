import { useState, useEffect } from 'react';
import APIService from '../services/api';

export default function DocumentationPage() {
  const [apiKey, setApiKey] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const { data } = await APIService.get('/keys');
      if (data && data.length > 0) {
        setApiKey(data[0].key_value || data[0].key);
      }
    } catch (e) {
      console.error('Failed to fetch keys', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px 48px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '32px' }}>AAIA API Documentation</h1>
      
      <div style={{ background: '#FFF', border: '1px solid #EBEBEB', borderRadius: '16px', padding: '40px' }}>
        <h2 style={{ marginTop: 0 }}>Authentication</h2>
        <p style={{ color: '#555', lineHeight: 1.6 }}>
          Authenticate your API requests using a Bearer token. You can generate this token in the <b>API Keys</b> section of this console.
        </p>
        <pre style={{ background: '#F5F5F5', padding: '16px', borderRadius: '8px', overflowX: 'auto', fontSize: '13px', color: '#333' }}>
{`Authorization: Bearer ${loading ? 'loading...' : (apiKey || 'YOUR_API_KEY_HERE')}`}
        </pre>
        {!apiKey && !loading && (
          <div style={{ fontSize: 13, color: '#A32D2D', marginTop: 8 }}>
            * You don't have an active API key yet. Generate one in the API Keys tab.
          </div>
        )}

        <h2 style={{ marginTop: '40px' }}>Chat Completions Endpoint</h2>
        <p style={{ color: '#555', lineHeight: 1.6 }}>
          Creates a model response for the given chat conversation.
        </p>
        <pre style={{ background: '#F5F5F5', padding: '16px', borderRadius: '8px', overflowX: 'auto', fontSize: '13px', color: '#333' }}>
{`curl https://api.achtrex.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey || 'YOUR_API_KEY_HERE'}" \\
  -d '{
    "model": "aaia-1.0",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful assistant."
      },
      {
        "role": "user",
        "content": "Hello!"
      }
    ]
  }'`}
        </pre>
      </div>
    </div>
  );
}
