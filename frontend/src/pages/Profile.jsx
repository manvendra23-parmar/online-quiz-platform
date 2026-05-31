import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, KeyRound, AlertCircle, CheckCircle, Save } from 'lucide-react';
import { AVATAR_OPTIONS } from './Register';

export default function Profile() {
  const { user, updateUserProfile } = useAuth();
  
  const [username, setUsername] = useState(user?.username || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || 'avatar_1');
  
  // Password updates
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // States
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!username) return setError('Username cannot be empty');
    
    setLoading(true);
    try {
      const res = await updateUserProfile({ username, avatar: selectedAvatar });
      if (res.success) {
        setSuccess('Profile details updated successfully!');
      } else {
        setError(res.message || 'Failed to update profile.');
      }
    } catch (err) {
      setError('An error occurred during update.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!password || !confirmPassword) {
      return setError('Please fill in both password fields');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    
    setLoading(true);
    try {
      const res = await updateUserProfile({ password });
      if (res.success) {
        setSuccess('Password changed successfully!');
        setPassword('');
        setConfirmPassword('');
      } else {
        setError(res.message || 'Failed to change password.');
      }
    } catch (err) {
      setError('An error occurred during password change.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container anim-fade-in" style={{ paddingBottom: '4rem', maxWidth: '800px' }}>
      <div className="auth-header" style={{ marginBottom: '2.5rem', textAlign: 'left' }}>
        <h2 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Account Profile Settings</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your personal candidate details, choose custom avatars, and secure your credentials.</p>
      </div>

      {error && (
        <div className="alert alert-danger anim-slide-up">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success anim-slide-up">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Left Column: Personal info & avatar selection */}
        <div className="glass-panel profile-card anim-zoom-in">
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', textAlign: 'left' }}>Personal Information</h3>
          
          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <div style={{ position: 'relative' }}>
                <User 
                  size={18} 
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} 
                />
                <input 
                  type="text" 
                  className="form-input" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label">Select Profile Icon</label>
              <div className="avatar-selector-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {AVATAR_OPTIONS.map((av) => (
                  <div 
                    key={av.id}
                    className={`avatar-option ${selectedAvatar === av.id ? 'selected' : ''}`}
                    onClick={() => setSelectedAvatar(av.id)}
                    style={{ width: '50px', height: '50px', fontSize: '1.5rem' }}
                  >
                    {av.emoji}
                  </div>
                ))}
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-hover-grow"
              style={{ width: '100%', padding: '0.75rem' }}
              disabled={loading}
            >
              <Save size={16} />
              Save Details
            </button>
          </form>
        </div>

        {/* Right Column: Password security updating */}
        <div className="glass-panel profile-card anim-zoom-in" style={{ height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', textAlign: 'left' }}>Change Password</h3>
          
          <form onSubmit={handleUpdatePassword}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <KeyRound 
                  size={18} 
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} 
                />
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label">Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <KeyRound 
                  size={18} 
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} 
                />
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-hover-grow"
              style={{ width: '100%', padding: '0.75rem', background: 'var(--primary-color)' }}
              disabled={loading}
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
