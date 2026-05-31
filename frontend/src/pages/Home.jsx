import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Zap, Award, CheckCircle } from 'lucide-react';

export default function Home({ navigateTo }) {
  const { user } = useAuth();

  return (
    <div className="container anim-fade-in">
      <div className="hero-section">
        <span className="hero-tag">Transforming digital exams</span>
        <h1 className="hero-title">Assessments Made Sleek, Secure, and Intelligent</h1>
        <p className="hero-desc">
          Create, administer, and attempt timed assessments with real-time scoring, negative marking, comprehensive analytics, and instant rankings. Perfect for academies, bootcamps, and organizations.
        </p>
        <div className="hero-actions">
          {user ? (
            <button 
              onClick={() => navigateTo('dashboard')} 
              className="btn btn-primary btn-hover-grow"
              style={{ padding: '1rem 2.5rem', borderRadius: 'var(--radius-md)' }}
            >
              Go to Dashboard
            </button>
          ) : (
            <>
              <button 
                onClick={() => navigateTo('register')} 
                className="btn btn-primary btn-hover-grow"
                style={{ padding: '1rem 2.5rem', borderRadius: 'var(--radius-md)' }}
              >
                Get Started Free
              </button>
              <button 
                onClick={() => navigateTo('login')} 
                className="btn btn-secondary"
                style={{ padding: '1rem 2.5rem', borderRadius: 'var(--radius-md)' }}
              >
                Admin Access
              </button>
            </>
          )}
        </div>

        <div className="features-grid">
          <div className="feature-card glass-panel card-hover-expand">
            <div className="feature-icon-wrapper">
              <Zap size={24} />
            </div>
            <h3>Interactive Quizzes</h3>
            <p>Attempt timed assessments with randomized questions, live visual counters, question flagging, and instant grading breakdown.</p>
          </div>

          <div className="feature-card glass-panel card-hover-expand">
            <div className="feature-icon-wrapper">
              <Shield size={24} />
            </div>
            <h3>Anti-Cheat Security</h3>
            <p>Strict server-side validation hides correct answers during active sessions and automatically submits work on timer expiry.</p>
          </div>

          <div className="feature-card glass-panel card-hover-expand">
            <div className="feature-icon-wrapper">
              <Award size={24} />
            </div>
            <h3>Real-time Leaderboard</h3>
            <p>Track performance rankings dynamically. Stand on the podium and watch your competitive status evolve as you attempt new challenges.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
