import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, KeyRound, User, AlertCircle, ArrowRight } from 'lucide-react';

const AVATAR_OPTIONS = [
  { id: 'avatar_1', emoji: '🦊' },
  { id: 'avatar_2', emoji: '🦁' },
  { id: 'avatar_3', emoji: '🐯' },
  { id: 'avatar_4', emoji: '🐼' },
  { id: 'avatar_5', emoji: '🐸' },
  { id: 'avatar_6', emoji: '🐙' },
  { id: 'avatar_7', emoji: '🦄' },
  { id: 'avatar_8', emoji: '🦖' }
];

export default function Register({ navigateTo }) {
  const { registerUser } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('avatar_1');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      return setError('Please fill in all fields');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    
    setError('');
    setLoading(true);
    
    const res = await registerUser(username, email, password, selectedAvatar);
    setLoading(false);
    
    if (res.success) {
      navigateTo('dashboard');
    } else {
      setError(res.message || 'Registration failed.');
    }
  };

  return (
    <div className="auth-wrapper anim-slide-up">
      <div className="auth-card glass-panel" style={{ maxWidth: '480px' }}>
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join Quizora to challenge your limits</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
                placeholder="AlexCoder"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail 
                size={18} 
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} 
              />
              <input 
                type="email" 
                className="form-input" 
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
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
            <label className="form-label">Choose Avatar</label>
            <div className="avatar-selector-grid">
              {AVATAR_OPTIONS.map((av) => (
                <div 
                  key={av.id}
                  className={`avatar-option ${selectedAvatar === av.id ? 'selected' : ''}`}
                  onClick={() => setSelectedAvatar(av.id)}
                >
                  {av.emoji}
                </div>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-hover-grow" 
            style={{ width: '100%', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <button 
            onClick={() => navigateTo('login')} 
            style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 600 }}
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
}
export { AVATAR_OPTIONS };
