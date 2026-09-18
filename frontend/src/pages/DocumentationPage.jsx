import { useState, useEffect } from 'react';
import APIService from '../services/api';
import { 
  BookOpen, 
  Copy, 
  Check, 
  Terminal, 
  Code2, 
  ShieldCheck, 
  Key,
  Cpu,
  Sparkles
} from 'lucide-react';

export default function DocumentationPage() {
  const [apiKey, setApiKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState('curl'); // 'curl', 'python', 'node'
  const [copiedKey, setCopiedKey] = useState(null);

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

  const handleCopyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const activeKey = apiKey || 'aaia_live_your_api_key_here';

  const snippets = {
    curl: `curl https://aaia.achtrex.com/api/chat \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${activeKey}" \\
  -d '{
    "message": "Diagnose cylinder misfire DTC P0301 on 2020 Honda Civic 1.5T",
    "vehicleContext": { "year": 2020, "make": "Honda", "model": "Civic" }
  }'`,
    python: `import requests

url = "https://aaia.achtrex.com/api/chat"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer ${activeKey}"
}
payload = {
    "message": "Diagnose cylinder misfire DTC P0301 on 2020 Honda Civic 1.5T",
    "vehicleContext": {"year": 2020, "make": "Honda", "model": "Civic"}
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`,
    node: `const axios = require('axios');

async function runDiagnostic() {
  const res = await axios.post('https://aaia.achtrex.com/api/chat', {
    message: 'Diagnose cylinder misfire DTC P0301 on 2020 Honda Civic 1.5T',
    vehicleContext: { year: 2020, make: 'Honda', model: 'Civic' }
  }, {
    headers: {
      'Authorization': 'Bearer ${activeKey}'
    }
  });

  console.log(res.data);
}

runDiagnostic();`
  };

  return (
    <div style={{ padding: '40px 48px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 8px 0', color: 'var(--dgray)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <BookOpen size={28} style={{ color: 'var(--dblu)' }} /> AAIA Developer Documentation
        </h1>
        <p style={{ margin: 0, color: 'var(--gray)', fontSize: '15px' }}>Integrate AAIA's automotive intelligence, DTC diagnostics, and vehicle history into your systems.</p>
      </div>
      
      <div style={{ background: '#FFF', border: '1px solid #EBEBEB', borderRadius: '16px', padding: '40px', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
        <h2 style={{ marginTop: 0, fontSize: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Key size={20} style={{ color: 'var(--dblu)' }} /> Authentication
        </h2>
        <p style={{ color: '#555', lineHeight: 1.6, fontSize: 14 }}>
          All API requests must include your secret API key in the <code style={{ background: '#F1F5F9', padding: '2px 6px', borderRadius: 4, color: 'var(--dblu)' }}>Authorization</code> HTTP header as a Bearer token.
        </p>
        
        <div style={{ position: 'relative', marginTop: 12 }}>
          <pre style={{ background: '#1E293B', padding: '16px 20px', borderRadius: '8px', overflowX: 'auto', fontSize: '13px', color: '#38BDF8', margin: 0 }}>
            {`Authorization: Bearer ${loading ? 'loading...' : activeKey}`}
          </pre>
          <button 
            onClick={() => handleCopyCode(`Bearer ${activeKey}`, 'auth')}
            style={{ position: 'absolute', right: 12, top: 12, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            {copiedKey === 'auth' ? <><Check size={14} color="#10B981" /> Copied</> : <><Copy size={14} /> Copy</>}
          </button>
        </div>

        {!apiKey && !loading && (
          <div style={{ fontSize: 13, color: '#A32D2D', marginTop: 8 }}>
            * You don't have an active API key yet. Generate one in the API Keys tab.
          </div>
        )}

        <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Terminal size={20} style={{ color: 'var(--dblu)' }} /> Diagnostic Chat API
          </h2>

          <div style={{ display: 'flex', background: '#F1F5F9', padding: 4, borderRadius: 8, gap: 4 }}>
            {['curl', 'python', 'node'].map(l => (
              <button 
                key={l}
                onClick={() => setLang(l)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 6,
                  border: 'none',
                  background: lang === l ? '#fff' : 'transparent',
                  color: lang === l ? 'var(--dblu)' : '#64748B',
                  fontWeight: 600,
                  fontSize: 12,
                  cursor: 'pointer',
                  boxShadow: lang === l ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                {l === 'curl' ? 'cURL' : l === 'python' ? 'Python' : 'Node.js'}
              </button>
            ))}
          </div>
        </div>

        <p style={{ color: '#555', lineHeight: 1.6, fontSize: 14, marginTop: 12 }}>
          Send automotive troubleshooting requests, OBD-II DTC codes, or mechanic inquiries to get structured diagnostic repair steps.
        </p>

        <div style={{ position: 'relative', marginTop: 12 }}>
          <pre style={{ background: '#0F172A', padding: '20px', borderRadius: '8px', overflowX: 'auto', fontSize: '13px', color: '#F8FAFC', lineHeight: 1.5, margin: 0 }}>
            {snippets[lang]}
          </pre>
          <button 
            onClick={() => handleCopyCode(snippets[lang], 'code')}
            style={{ position: 'absolute', right: 12, top: 12, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            {copiedKey === 'code' ? <><Check size={14} color="#10B981" /> Copied</> : <><Copy size={14} /> Copy Code</>}
          </button>
        </div>

      </div>
    </div>
  );
}
