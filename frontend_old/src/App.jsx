import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Login from './screens/Login';
import Chat from './screens/Chat';
import VINLookup from './screens/VINLookup';
import FleetDashboard from './screens/FleetDashboard';

function AppLayout({ children }) {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login';

  if (isAuthPage) {
    return <div className="app-layout">{children}</div>;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/chat" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/vin" element={<VINLookup />} />
          <Route path="/fleet" element={<FleetDashboard />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
