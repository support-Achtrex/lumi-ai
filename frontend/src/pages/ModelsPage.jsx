export default function ModelsPage() {
  const models = [
    { name: 'LUMI 1.0', context: '128K', speed: 'Ultra-fast', description: 'Our fastest and most capable model. Perfect for coding, reasoning, and complex tool-calling.' },
    { name: 'LUMI Vision', context: '64K', speed: 'Fast', description: 'Designed specifically for visual comprehension and image analysis tasks.' },
    { name: 'LUMI Voice', context: '32K', speed: 'Real-time', description: 'Optimized for speech-to-text and conversational voice interactions.' },
  ];

  return (
    <div style={{ padding: '40px 48px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '32px' }}>Available Models</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {models.map(model => (
          <div key={model.name} style={{ background: '#FFF', border: '1px solid #EBEBEB', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '18px' }}>{model.name}</h3>
            <p style={{ color: '#555', lineHeight: '1.5', flex: 1, margin: '0 0 24px 0' }}>{model.description}</p>
            <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid #EBEBEB', paddingTop: '16px' }}>
              <div style={{ fontSize: '13px' }}><span style={{ color: '#888' }}>Context:</span> <b>{model.context}</b></div>
              <div style={{ fontSize: '13px' }}><span style={{ color: '#888' }}>Speed:</span> <b>{model.speed}</b></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
