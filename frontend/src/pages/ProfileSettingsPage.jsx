// src/pages/ProfileSettingsPage.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import APIService from '../services/api';

export default function ProfileSettingsPage() {
  const { user, setUser } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [nameLoading, setNameLoading] = useState(false);
  const [nameMessage, setNameMessage] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMessage, setPwdMessage] = useState('');
  const [pwdError, setPwdError] = useState('');

  async function handleUpdateProfile(e) {
    e.preventDefault();
    if (!name.trim()) return;
    
    setNameLoading(true);
    setNameMessage('');
    try {
      await APIService.updateProfile(name);
      
      // Update local context
      const updatedUser = { ...user, name };
      setUser(updatedUser);
      localStorage.setItem('lumi_user', JSON.stringify(updatedUser));
      
      setNameMessage('Profile updated successfully.');
      setTimeout(() => setNameMessage(''), 3000);
    } catch (err) {
      setNameMessage(`Error: ${err.message || 'Failed to update'}`);
    } finally {
      setNameLoading(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPwdError('');
    setPwdMessage('');
    
    if (newPassword !== confirmPassword) {
      return setPwdError('New passwords do not match.');
    }
    if (newPassword.length < 8) {
      return setPwdError('Password must be at least 8 characters long.');
    }
    
    setPwdLoading(true);
    try {
      await APIService.changePassword(currentPassword, newPassword);
      setPwdMessage('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwdMessage(''), 3000);
    } catch (err) {
      setPwdError(`Error: ${err.message || 'Failed to update password'}`);
    } finally {
      setPwdLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 20px', fontFamily: "'Inter', sans-serif" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1C2B3A', marginBottom: 8 }}>Profile Settings</h1>
      <p style={{ color: '#607D8B', marginBottom: 32 }}>Manage your account settings and preferences.</p>

      {/* Profile Form */}
      <div style={cardStyle}>
        <h2 style={cardTitleStyle}>Personal Information</h2>
        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Full Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)}
              style={inputStyle}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Email Address</label>
            <input 
              type="email" 
              value={user?.email || ''} 
              style={{ ...inputStyle, background: '#F8FAFC', color: '#90A4AE', cursor: 'not-allowed' }}
              disabled
            />
            <div style={{ fontSize: 12, color: '#90A4AE', marginTop: 4 }}>Email cannot be changed directly. Contact support if needed.</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>
            <button type="submit" disabled={nameLoading || name === user?.name} style={buttonStyle}>
              {nameLoading ? 'Saving...' : 'Save Changes'}
            </button>
            {nameMessage && (
              <span style={{ fontSize: 13, color: nameMessage.includes('Error') ? '#D32F2F' : '#0F6E56', fontWeight: 500 }}>
                {nameMessage}
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Security Form */}
      <div style={cardStyle}>
        <h2 style={cardTitleStyle}>Security</h2>
        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Current Password</label>
            <input 
              type="password" 
              value={currentPassword} 
              onChange={e => setCurrentPassword(e.target.value)}
              style={inputStyle}
              required
            />
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>New Password</label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Confirm New Password</label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>
            <button type="submit" disabled={pwdLoading || !currentPassword || !newPassword || !confirmPassword} style={buttonStyle}>
              {pwdLoading ? 'Updating...' : 'Update Password'}
            </button>
            {pwdMessage && <span style={{ fontSize: 13, color: '#0F6E56', fontWeight: 500 }}>{pwdMessage}</span>}
            {pwdError && <span style={{ fontSize: 13, color: '#D32F2F', fontWeight: 500 }}>{pwdError}</span>}
          </div>
        </form>
      </div>
    </div>
  );
}

const cardStyle = {
  background: '#fff',
  borderRadius: 12,
  border: '1px solid #D0DCE8',
  padding: 32,
  marginBottom: 24,
  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
};

const cardTitleStyle = {
  fontSize: 18,
  fontWeight: 600,
  color: '#1C2B3A',
  margin: '0 0 24px 0',
  paddingBottom: 16,
  borderBottom: '1px solid #F0F4F8'
};

const labelStyle = {
  display: 'block',
  fontSize: 13,
  fontWeight: 500,
  color: '#607D8B',
  marginBottom: 6
};

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  height: 40,
  borderRadius: 8,
  border: '1px solid #D0DCE8',
  padding: '0 12px',
  fontSize: 14,
  color: '#1C2B3A',
  outline: 'none',
  transition: 'border-color 0.2s'
};

const buttonStyle = {
  height: 38,
  padding: '0 20px',
  background: '#1C2B3A',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'opacity 0.2s',
  opacity: 1
};
