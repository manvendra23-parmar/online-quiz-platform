import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { KeyRound, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export default function Login({ navigateTo }) {
  const { loginUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return setError('Please fill in all fields');
    }
    
    setError('');
    setLoading(true);
    
    const res = await loginUser(email, password);
    setLoading(false);
    
    if (res.success) {
      navigateTo('dashboard');
    } else {
      setError(res.message || 'Login failed. Verify credentials.');
    }
  };

  const handleQuickFill = (role) => {
    if (role === 'admin') {
      setEmail('admin@quizplatform.com');
      setPassword('adminpassword');
    } else {
      setEmail('user@quizplatform.com');
      setPassword('userpassword');
    }
  };

  return (
    <div className="auth-wrapper anim-slide-up">
      <div className="auth-card glass-panel">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Login to resume your assessment journey</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
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

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <KeyRound 
                size={18} 
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} 
              />
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-hover-grow" 
            style={{ width: '100%', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Sign In'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Quick Demo Accounts
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <button 
              onClick={() => handleQuickFill('admin')} 
              className="btn btn-secondary" 
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
            >
              Fill Admin
            </button>
            <button 
              onClick={() => handleQuickFill('user')} 
              className="btn btn-secondary" 
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
            >
              Fill Student
            </button>
          </div>
        </div>

        <div className="auth-footer">
          Don't have an account?{' '}
          <button 
            onClick={() => navigateTo('register')} 
            style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 600 }}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
