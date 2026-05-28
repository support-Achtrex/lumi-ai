import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={{
      backgroundColor: '#000000',
      minHeight: '100vh',
      width: '100vw',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      margin: 0,
      padding: 0,
      position: 'absolute',
      top: 0,
      left: 0,
      overflowX: 'hidden'
    }}>
      {/* Top Navigation */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem 3rem',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        zIndex: 10
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src="/logo.png" alt="LUMI AI" style={{ height: '40px' }} onError={(e) => {
            // Fallback CSS logo if the image isn't available yet
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }} />
          <div style={{
            display: 'none', // Shown only if image fails
            background: 'linear-gradient(135deg, #00d2ff 0%, #8a2be2 100%)',
            height: '40px',
            width: '40px',
            borderRadius: '50%',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(138,43,226,0.4)'
          }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              <div style={{ width: '5px', height: '5px', background: 'white', borderRadius: '50%' }} />
              <div style={{ width: '5px', height: '5px', background: 'white', borderRadius: '50%' }} />
              <div style={{ width: '5px', height: '5px', background: 'white', borderRadius: '50%' }} />
            </div>
          </div>
          <span style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.5px' }}>LUMI</span>
        </div>

        {/* Links */}
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Link to="/chat" style={{ color: 'white', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500 }}>Chat</Link>
          <Link to="/vin" style={{ color: 'white', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500 }}>VIN Lookup</Link>
          <Link to="/fleet" style={{ color: 'white', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500 }}>Fleet</Link>
          <Link to="/login" style={{
            backgroundColor: 'white',
            color: 'black',
            textDecoration: 'none',
            padding: '0.5rem 1.25rem',
            borderRadius: '9999px',
            fontSize: '0.95rem',
            fontWeight: 600,
            transition: 'opacity 0.2s'
          }} onMouseOver={e => e.target.style.opacity = 0.9} onMouseOut={e => e.target.style.opacity = 1}>
            Sign In
          </Link>
        </div>
      </nav>

      {/* Main Content (x.ai style) */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 2rem',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Subtle background glow matching the logo */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80vw',
          height: '80vw',
          maxWidth: '800px',
          maxHeight: '800px',
          background: 'radial-gradient(circle, rgba(138,43,226,0.15) 0%, rgba(0,0,0,0) 70%)',
          zIndex: -1,
          pointerEvents: 'none'
        }} />

        <h1 style={{
          fontSize: 'clamp(3.5rem, 8vw, 6.5rem)',
          fontWeight: 700,
          letterSpacing: '-0.04em',
          margin: '0 0 1.5rem',
          lineHeight: 1.05
        }}>
          Understand the<br />Automotive Universe.
        </h1>
        
        <p style={{
          fontSize: '1.25rem',
          color: '#a1a1aa',
          maxWidth: '600px',
          margin: '0 0 3rem',
          lineHeight: 1.6
        }}>
          LUMI AI is an advanced reasoning engine designed specifically for deep vehicle diagnostics, fleet analytics, and real-time automotive intelligence.
        </p>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/chat" style={{
            backgroundColor: 'white',
            color: 'black',
            textDecoration: 'none',
            padding: '1rem 2rem',
            borderRadius: '9999px',
            fontSize: '1.1rem',
            fontWeight: 600,
            transition: 'transform 0.2s',
            display: 'inline-block'
          }} onMouseOver={e => e.target.style.transform = 'scale(1.05)'} onMouseOut={e => e.target.style.transform = 'scale(1)'}>
            Try LUMI AI
          </Link>
          <Link to="/fleet" style={{
            backgroundColor: 'transparent',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)',
            textDecoration: 'none',
            padding: '1rem 2rem',
            borderRadius: '9999px',
            fontSize: '1.1rem',
            fontWeight: 600,
            transition: 'background-color 0.2s',
            display: 'inline-block'
          }} onMouseOver={e => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'} onMouseOut={e => e.target.style.backgroundColor = 'transparent'}>
            View Fleet Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
