import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import APIService from '../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


export default function ConsoleDashboard() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    refreshUser();
  }, []);
  
  const [usage, setUsage] = useState({
    total_messages: 0,
    user_messages: 0,
    total_input_tokens: 0,
    total_output_tokens: 0
  });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const { data } = await APIService.get('/analytics/usage');
        setUsage(data);
        
        const chartRes = await APIService.get('/analytics/chart');
        setChartData(chartRes.data);
      } catch (e) {
        console.error('Failed to fetch usage', e);
      }
    };
    fetchUsage();
  }, []);

  const totalTokens = (parseInt(usage.total_input_tokens) || 0) + (parseInt(usage.total_output_tokens) || 0);
  // Use actual user credits instead of assumed $10 tier
  const remaining = Math.floor(user?.credits || 0).toLocaleString();
  const cost = (totalTokens).toLocaleString();
  const requests = parseInt(usage.user_messages) || 0;

  return (
    <div style={{ padding: '40px 48px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', m: 0 }}>Welcome, {user?.name?.split(' ')[0] || 'User'}</h1>
        <button 
          onClick={() => navigate('/console/api-keys')}
          style={{ 
          background: '#FFF', border: '1px solid #EBEBEB', padding: '8px 16px', borderRadius: '24px', 
          fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}>
          <i className="ti ti-plus" style={{ fontSize: '14px' }}/> Create API key
        </button>
      </div>

      {/* Auto Top Up Banner */}
      <div style={{ 
        background: '#FFF', borderRadius: '16px', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', 
        alignItems: 'center', marginBottom: '40px', border: '1px solid #EBEBEB', boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ color: '#4285F4', background: '#F0F5FF', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <i className="ti ti-refresh" style={{ fontSize: '20px' }} />
          </div>
          <div>
            <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>Enable auto top up</div>
            <div style={{ color: '#888', fontSize: '14px' }}>Never run out of credits</div>
          </div>
        </div>
        <button style={{ background: '#000', color: '#FFF', border: 'none', padding: '10px 24px', borderRadius: '24px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
          Enable
        </button>
      </div>

      {/* Usage Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          Usage <span style={{ color: '#888', fontWeight: '400' }}>this month <i className="ti ti-chevron-down" style={{ fontSize: '12px' }}/></span>
        </h2>
        <a href="#" style={{ color: '#555', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>See all</a>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
        {/* Credits Card */}
        <div style={{ background: '#FFF', border: '1px solid #EBEBEB', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div style={{ color: '#555', fontSize: '14px' }}>Credits remaining</div>
            <button style={{ background: '#FFF', border: '1px solid #EBEBEB', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
              <i className="ti ti-plus" style={{ fontSize: '12px' }}/> Add
            </button>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px' }}>{remaining}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555', fontSize: '14px', marginTop: 'auto' }}>
            <span>Tokens generated</span>
            <span style={{ fontWeight: '600', color: '#000' }}>{cost}</span>
          </div>
        </div>

        {/* Tokens Card */}
        <div style={{ background: '#FFF', border: '1px solid #EBEBEB', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ color: '#555', fontSize: '14px', marginBottom: '12px' }}>Tokens</div>
          <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>{totalTokens.toLocaleString()}</div>
          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'flex-end', height: '40px', gap: '4px', borderBottom: '1px dashed #EBEBEB', paddingBottom: '4px' }}>
          </div>
        </div>

        {/* Requests Card */}
        <div style={{ background: '#FFF', border: '1px solid #EBEBEB', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ color: '#555', fontSize: '14px', marginBottom: '12px' }}>Requests</div>
          <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>{requests.toLocaleString()}</div>
          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'flex-end', height: '40px', gap: '4px', borderBottom: '1px dashed #EBEBEB', paddingBottom: '4px' }}>
          </div>
        </div>
      </div>
      
      {/* Chart Section */}
      <div style={{ background: '#FFF', border: '1px solid #EBEBEB', borderRadius: '16px', padding: '24px', marginBottom: '40px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 24px 0', color: '#333' }}>API Usage (30 days)</h3>
        <div style={{ height: '300px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#000000" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #EBEBEB', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                labelStyle={{ fontWeight: '600', color: '#000', marginBottom: '4px' }}
              />
              <Area type="monotone" dataKey="tokens" stroke="#000000" strokeWidth={2} fillOpacity={1} fill="url(#colorTokens)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Products Section */}
      <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 20px 0' }}>Explore our products</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
        
        {/* Chat API */}
        <div style={{ background: '#FFF', border: '1px solid #EBEBEB', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: '#F5F5F5', borderRadius: '8px', padding: '16px', marginBottom: '24px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ alignSelf: 'flex-end', background: '#FFF', padding: '8px 12px', borderRadius: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              How's the weather like tomorrow?
            </div>
            <div style={{ color: '#888', fontSize: '12px' }}>3 tools · 12s</div>
            <div style={{ fontWeight: '500' }}>It'll be sunny in London tomorrow, great for a day out! Want some suggestions?</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
               <i className="ti ti-message-circle" style={{ fontSize: '18px', color: '#555' }} /> Chat API
            </div>
            <span style={{ background: '#FFF0E5', color: '#E85D04', fontSize: '12px', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>LUMI 1.0</span>
          </div>
          <div style={{ color: '#555', fontSize: '13px', lineHeight: '1.5' }}>
            Strong agentic tool calling with minimal hallucinations. Supports non-reasoning mode.
          </div>
        </div>

        {/* Voice API */}
        <div style={{ background: '#FFF', border: '1px solid #EBEBEB', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: '#FAFAFA', borderRadius: '8px', height: '140px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#FFF', padding: '12px 24px', borderRadius: '32px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <i className="ti ti-microphone" style={{ fontSize: '20px' }} />
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <div style={{ width: '3px', height: '12px', background: '#4285F4', borderRadius: '2px' }}></div>
                <div style={{ width: '3px', height: '24px', background: '#4285F4', borderRadius: '2px' }}></div>
                <div style={{ width: '3px', height: '16px', background: '#4285F4', borderRadius: '2px' }}></div>
                <div style={{ width: '3px', height: '28px', background: '#4285F4', borderRadius: '2px' }}></div>
                <div style={{ width: '3px', height: '14px', background: '#4285F4', borderRadius: '2px' }}></div>
              </div>
              <div style={{ width: '24px', height: '24px', background: '#000', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <div style={{ width: '8px', height: '8px', background: '#FFF', borderRadius: '2px' }}></div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', marginBottom: '12px' }}>
            <i className="ti ti-chart-arcs" style={{ fontSize: '18px', color: '#555' }} /> Voice API
          </div>
          <div style={{ color: '#555', fontSize: '13px', lineHeight: '1.5' }}>
            Real-time conversations, speech-to-text, and text-to-speech.
          </div>
        </div>

        {/* Imagine API */}
        <div style={{ background: '#FFF', border: '1px solid #EBEBEB', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: '#000', borderRadius: '8px', height: '140px', marginBottom: '24px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
             {/* Mocking the video thumbnail with a colored background */}
             <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(45deg, #4A2311, #8A431F)' }}></div>
             <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.8 }}>
                 <i className="ti ti-car" style={{ fontSize: '48px' }} />
             </div>
             <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(0,0,0,0.5)', padding: '4px 8px', borderRadius: '16px', display: 'flex', gap: '8px', fontSize: '12px' }}>
               <i className="ti ti-video" />
               <i className="ti ti-photo" />
             </div>
             <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(0,0,0,0.5)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>
               0:12
             </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', marginBottom: '12px' }}>
            <i className="ti ti-photo" style={{ fontSize: '18px', color: '#555' }} /> Imagine API
          </div>
          <div style={{ color: '#555', fontSize: '13px', lineHeight: '1.5' }}>
            Turn ideas into reality with image and video generation.
          </div>
        </div>

      </div>

      {/* Bottom Banner */}
      <div style={{ background: '#FFF', border: '1px solid #EBEBEB', borderRadius: '16px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontWeight: '700', fontSize: '16px' }}>LUMI <span style={{ color: '#888', fontWeight: '400' }}>Business</span></span>
          <div style={{ width: '1px', height: '24px', background: '#EBEBEB' }}></div>
          <span style={{ color: '#555', fontSize: '15px' }}>Subscribe to LUMI for your team, get free API credits.</span>
        </div>
        <button style={{ background: '#000', color: '#FFF', border: 'none', padding: '10px 24px', borderRadius: '24px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
          Learn more
        </button>
      </div>

    </div>
  );
}
