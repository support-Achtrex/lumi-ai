export default function DocumentationPage() {
  return (
    <div style={{ padding: '40px 48px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '32px' }}>LUMI API Documentation</h1>
      
      <div style={{ background: '#FFF', border: '1px solid #EBEBEB', borderRadius: '16px', padding: '40px' }}>
        <h2 style={{ marginTop: 0 }}>Authentication</h2>
        <p style={{ color: '#555', lineHeight: 1.6 }}>
          Authenticate your API requests using a Bearer token. You can generate this token in the <b>API Keys</b> section of this console.
        </p>
        <pre style={{ background: '#F5F5F5', padding: '16px', borderRadius: '8px', overflowX: 'auto', fontSize: '13px', color: '#333' }}>
{`Authorization: Bearer lumi-your-api-key-here`}
        </pre>

        <h2 style={{ marginTop: '40px' }}>Chat Completions Endpoint</h2>
        <p style={{ color: '#555', lineHeight: 1.6 }}>
          Creates a model response for the given chat conversation.
        </p>
        <pre style={{ background: '#F5F5F5', padding: '16px', borderRadius: '8px', overflowX: 'auto', fontSize: '13px', color: '#333' }}>
{`POST https://api.achtrex.com/v1/chat/completions

{
  "model": "lumi-1.0",
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
}`}
        </pre>
      </div>
    </div>
  );
}
