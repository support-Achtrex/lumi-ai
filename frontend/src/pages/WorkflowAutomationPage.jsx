import { useNavigate } from 'react-router-dom';

export default function WorkflowAutomationPage() {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Starter',
      price: '$49',
      interval: '/mo',
      description: 'Perfect for small teams getting started with automation.',
      features: ['Up to 1,000 requests', 'Basic models', 'Email support', 'Standard API access'],
      buttonText: 'Proceed to Pay',
      isPopular: false,
    },
    {
      name: 'Pro',
      price: '$199',
      interval: '/mo',
      description: 'Ideal for growing teams with higher volume needs.',
      features: ['Up to 10,000 requests', 'Advanced models', 'Priority support', 'Webhooks & integrations', 'Custom rate limits'],
      buttonText: 'Proceed to Pay',
      isPopular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      interval: '',
      description: 'Tailored solutions for large organizations.',
      features: ['Unlimited requests', 'Custom model training', '24/7 dedicated support', 'SLA guarantees', 'On-premise deployment options'],
      buttonText: 'Contact Sales',
      isPopular: false,
    }
  ];

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', color: '#1C2B3A', marginBottom: '16px' }}>Workflow Automation & API Access</h1>
        <p style={{ fontSize: '16px', color: '#607D8B', maxWidth: '600px', margin: '0 auto' }}>
          Cut manual processing time by up to 80%. Select a plan to access the LUMI API and supercharge your workflows.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
        {plans.map((plan) => (
          <div key={plan.name} style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '30px',
            border: plan.isPopular ? '2px solid #0F6E56' : '1px solid #D0DCE8',
            boxShadow: plan.isPopular ? '0 12px 24px rgba(15, 110, 86, 0.1)' : '0 4px 12px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
          }}>
            {plan.isPopular && (
              <div style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#0F6E56',
                color: '#fff',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                letterSpacing: '0.5px'
              }}>
                MOST POPULAR
              </div>
            )}
            
            <h2 style={{ fontSize: '24px', color: '#1C2B3A', marginBottom: '8px' }}>{plan.name}</h2>
            <p style={{ color: '#607D8B', fontSize: '14px', marginBottom: '24px', minHeight: '40px' }}>{plan.description}</p>
            
            <div style={{ marginBottom: '30px', display: 'flex', alignItems: 'baseline' }}>
              <span style={{ fontSize: '36px', fontWeight: 'bold', color: '#1C2B3A' }}>{plan.price}</span>
              <span style={{ color: '#90A4AE', marginLeft: '4px' }}>{plan.interval}</span>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 30px 0', flex: 1 }}>
              {plan.features.map((feature, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', color: '#37474F', fontSize: '14px' }}>
                  <i className="ti ti-check" style={{ color: '#0F6E56', marginRight: '10px', fontSize: '16px' }} />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => {
                if (plan.name !== 'Enterprise') {
                  navigate('/console');
                }
              }}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                background: plan.isPopular ? '#0F6E56' : '#F5F8FC',
                color: plan.isPopular ? '#fff' : '#1C2B3A',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.2s',
                border: plan.isPopular ? 'none' : '1px solid #D0DCE8'
              }}
              onMouseEnter={(e) => {
                if (!plan.isPopular) e.target.style.background = '#E2E8F0';
              }}
              onMouseLeave={(e) => {
                if (!plan.isPopular) e.target.style.background = '#F5F8FC';
              }}
            >
              {plan.buttonText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
