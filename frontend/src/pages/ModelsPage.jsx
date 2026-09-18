import { Cpu, Eye, Mic, Zap, Sparkles, Layers, ShieldCheck, Gauge } from 'lucide-react';

export default function ModelsPage() {
  const models = [
    { 
      name: 'AAIA 2.5 Diagnostic Pro', 
      icon: Cpu,
      badge: 'Flagship',
      context: '1M tokens', 
      speed: 'Ultra-fast (450 t/s)', 
      description: 'Our primary automotive intelligence engine. Engineered for complex OBD-II DTC root-cause analysis, wiring diagrams, repair guides, and multi-step tool execution.' 
    },
    { 
      name: 'AAIA Vision Damage Inspector', 
      icon: Eye,
      badge: 'Multimodal',
      context: '128K tokens', 
      speed: 'Fast (180 t/s)', 
      description: 'Specialized visual comprehension for vehicle exterior dents, scratches, undercarriage rust, spark plug fouling photos, and tyre tread wear analysis.' 
    },
    { 
      name: 'AAIA Voice Workshop Assistant', 
      icon: Mic,
      badge: 'Audio AI',
      context: '32K tokens', 
      speed: 'Real-time (<200ms)', 
      description: 'Hands-free voice recognition tuned for noisy workshop environments, mechanic voice memos, acoustic engine knock identification, and voice diagnostics.' 
    },
    { 
      name: 'AAIA Telemetry & TCO Predictor', 
      icon: Gauge,
      badge: 'Analytics',
      context: '256K tokens', 
      speed: 'Instant', 
      description: 'High-throughput predictive maintenance engine calculating fleet total cost of ownership, failure probability distributions, and part wear schedules.' 
    }
  ];

  return (
    <div style={{ padding: '40px 48px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 8px 0', color: 'var(--dgray)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Cpu size={28} style={{ color: 'var(--dblu)' }} /> Available Automotive AI Models
        </h1>
        <p style={{ margin: 0, color: 'var(--gray)', fontSize: '15px' }}>Domain-specific neural networks and multimodal reasoning engines optimized for automotive engineering.</p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {models.map(model => {
          const IconComp = model.icon;
          return (
            <div key={model.name} style={{ background: '#FFF', border: '1px solid #EBEBEB', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 12px rgba(0,0,0,0.03)', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F5F8FC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dblu)', border: '1px solid var(--bord)' }}>
                  <IconComp size={22} />
                </div>
                <span style={{ background: '#EBF3FE', color: 'var(--dblu)', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 12 }}>
                  {model.badge}
                </span>
              </div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 700, color: 'var(--dgray)' }}>{model.name}</h3>
              <p style={{ color: '#555', lineHeight: '1.6', flex: 1, margin: '0 0 24px 0', fontSize: 14 }}>{model.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #EBEBEB', paddingTop: '16px' }}>
                <div style={{ fontSize: '13px' }}><span style={{ color: '#888' }}>Context:</span> <b>{model.context}</b></div>
                <div style={{ fontSize: '13px' }}><span style={{ color: '#888' }}>Latency:</span> <b>{model.speed}</b></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
