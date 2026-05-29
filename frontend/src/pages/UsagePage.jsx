export default function UsagePage() {
  return (
    <div style={{ padding: '40px 48px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '32px' }}>Usage</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div style={{ background: '#FFF', border: '1px solid #EBEBEB', borderRadius: '16px', padding: '32px' }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#555' }}>Total Tokens (May)</h2>
          <div style={{ fontSize: '40px', fontWeight: '700' }}>174,246</div>
          <div style={{ marginTop: '24px', height: '100px', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
            {/* Simulated bar chart */}
            {[20, 30, 80, 50, 10, 0, 15, 20].map((h, i) => (
              <div key={i} style={{ flex: 1, background: '#000', height: \`\${h}%\`, borderRadius: '4px 4px 0 0' }} />
            ))}
          </div>
        </div>

        <div style={{ background: '#FFF', border: '1px solid #EBEBEB', borderRadius: '16px', padding: '32px' }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#555' }}>API Requests (May)</h2>
          <div style={{ fontSize: '40px', fontWeight: '700' }}>244</div>
          <div style={{ marginTop: '24px', height: '100px', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
            {/* Simulated bar chart */}
            {[5, 10, 40, 25, 5, 0, 8, 12].map((h, i) => (
              <div key={i} style={{ flex: 1, background: '#000', height: \`\${h}%\`, borderRadius: '4px 4px 0 0' }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
