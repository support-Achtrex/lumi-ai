import { useState, useRef, useEffect } from 'react';
import { Mic, Image as ImageIcon, Shield, Plus, AudioLines, User } from 'lucide-react';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage, { role: 'assistant', content: '' }]);
    const currentInput = input;
    setInput('');

    try {
      const token = localStorage.getItem('token') || 'mock_token';
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: currentInput })
      });

      if (!response.ok) throw new Error('Backend unavailable');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          newMessages[lastIndex].content += chunk.replace(/^data: |\\n$/g, '').replace(/{"type":"token","text":"(.*?)"}/g, '$1');
          return newMessages;
        });
      }
    } catch (error) {
      let mockupResponse = "I am LUMI AI. Your database is currently offline, so I am running in local demonstration mode. To unlock my full reasoning capabilities, please start the PostgreSQL server and provide the database credentials.";
      let index = 0;
      const interval = setInterval(() => {
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          newMessages[lastIndex].content = mockupResponse.substring(0, index + 1);
          return newMessages;
        });
        index++;
        if (index >= mockupResponse.length) clearInterval(interval);
      }, 25);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', background: 'var(--bg-dark)' }}>
      {/* Top right toggles */}
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', gap: '1.5rem', zIndex: 10 }}>
        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
          <ImageIcon size={18} /> Imagine
        </button>
        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <Shield size={18} /> Private
        </button>
      </div>

      {messages.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 2rem', marginTop: '-5vh' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #00d2ff 0%, #8a2be2 100%)', height: '48px', width: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                <div style={{ width: '5px', height: '5px', background: 'white', borderRadius: '50%' }} />
                <div style={{ width: '5px', height: '5px', background: 'white', borderRadius: '50%' }} />
                <div style={{ width: '5px', height: '5px', background: 'white', borderRadius: '50%' }} />
              </div>
            </div>
            <h1 style={{ margin: 0, fontSize: '3rem', fontWeight: 700, letterSpacing: '-1px' }}>LUMI</h1>
          </div>

          {/* Input Box */}
          <div style={{ width: '100%', maxWidth: '750px', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '9999px', padding: '0.5rem 0.5rem 0.5rem 1rem', display: 'flex', alignItems: 'center', boxShadow: 'var(--glass-shadow)' }}>
            <button style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', color: 'var(--text-main)', cursor: 'pointer', padding: '0' }}>
              <Plus size={20} />
            </button>
            <input 
              type="text" 
              placeholder="What's on your mind?" 
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', padding: '0.75rem 1rem', fontSize: '1rem', color: 'var(--text-main)' }}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(e)}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer', marginRight: '0.5rem' }}>Fast ▾</span>
              <button style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', color: 'var(--text-muted)', cursor: 'pointer', padding: '0' }}>
                <Mic size={20} />
              </button>
              <button onClick={handleSend} style={{ background: 'black', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '50%', color: 'white', cursor: 'pointer', marginLeft: '0.25rem' }}>
                <AudioLines size={18} />
              </button>
            </div>
          </div>

          {/* Banner */}
          <div style={{ width: '100%', maxWidth: '750px', marginTop: '1.5rem', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 'var(--glass-shadow)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <span style={{ fontSize: '1.2rem' }}>📊</span>
                <span style={{ fontSize: '1.2rem' }}>📧</span>
                <span style={{ fontSize: '1.2rem' }}>📅</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Connectors are now available.</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Connectors allow LUMI to interact with fleet APIs directly in conversations.</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer' }}>Dismiss</button>
              <button style={{ background: 'black', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Connect</button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem 1.5rem 8rem', display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '1.5rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: msg.role === 'user' ? 'var(--border-color)' : 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'white', marginTop: '2px' }}>
                {msg.role === 'user' ? <User size={18} color="var(--text-main)" /> : <div style={{ background: 'linear-gradient(135deg, #00d2ff 0%, #8a2be2 100%)', width: '100%', height: '100%', borderRadius: '50%' }} />}
              </div>
              <div style={{ paddingTop: '0.25rem', lineHeight: '1.6', fontSize: '1rem', color: 'var(--text-main)' }}>
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input box pinned to bottom if there are messages */}
      {messages.length > 0 && (
        <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '750px', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '9999px', padding: '0.5rem 0.5rem 0.5rem 1rem', display: 'flex', alignItems: 'center', boxShadow: 'var(--glass-shadow)', zIndex: 10 }}>
          <button style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', color: 'var(--text-main)', cursor: 'pointer', padding: '0' }}>
            <Plus size={20} />
          </button>
          <input 
            type="text" 
            placeholder="Reply to LUMI..." 
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', padding: '0.75rem 1rem', fontSize: '1rem', color: 'var(--text-main)' }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(e)}
          />
          <button onClick={handleSend} style={{ background: 'black', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '50%', color: 'white', cursor: 'pointer' }}>
            <AudioLines size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
