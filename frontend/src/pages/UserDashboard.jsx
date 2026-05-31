import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Trophy, 
  Activity, 
  Calendar, 
  Percent, 
  Play, 
  CheckCircle, 
  HelpCircle, 
  Search 
} from 'lucide-react';

const AVATARS = {
  avatar_admin: '👑',
  avatar_1: '🦊',
  avatar_2: '🦁',
  avatar_3: '🐯',
  avatar_4: '🐼',
  avatar_5: '🐸',
  avatar_6: '🐙',
  avatar_7: '🦄',
  avatar_8: '🦖',
  default_avatar: '🧠'
};

export default function UserDashboard({ navigateTo }) {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const anaRes = await api.getUserAnalytics();
        const histRes = await api.getHistory();
        
        if (anaRes.success) setAnalytics(anaRes);
        if (histRes.success) setHistory(histRes.history);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="container anim-fade-in" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <div className="spinner"></div>
        <p>Generating personalized dashboard...</p>
      </div>
    );
  }

  const { summary, timeline, quizProgress } = analytics || {
    summary: { totalAttempts: 0, totalPassed: 0, passRate: '0.0', highestScore: '0.00' },
    timeline: [],
    quizProgress: []
  };

  // Custom SVG line chart plotting score trends
  const renderTrendChart = () => {
    if (!timeline || timeline.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-light)', fontStyle: 'italic' }}>
          No quiz history available to plot trend line. Attempt a quiz to see your progress!
        </div>
      );
    }

    const width = 500;
    const height = 150;
    const paddingX = 40;
    const paddingY = 25;
    
    // Find max score in timeline (minimum 100 to map percentages/scores)
    const maxVal = Math.max(...timeline.map(t => t.score), 10);
    
    // Calculate points coordinates
    const points = timeline.map((data, index) => {
      const x = paddingX + (index / Math.max(timeline.length - 1, 1)) * (width - 2 * paddingX);
      const y = height - paddingY - (data.score / maxVal) * (height - 2 * paddingY);
      return { x, y, ...data };
    });

    // Draw line path
    let pathD = '';
    if (points.length > 0) {
      pathD = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        // Linear path
        pathD += ` L ${points[i].x} ${points[i].y}`;
      }
    }

    // SVG Area path for under-the-curve gradient
    let areaD = '';
    if (points.length > 0) {
      areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;
    }

    return (
      <div className="chart-container">
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary-color)" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="var(--primary-color)" stopOpacity="0"/>
            </linearGradient>
          </defs>
          
          {/* Grid lines */}
          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4 4" />
          <line x1={paddingX} y1={(height - paddingY + paddingY) / 2} x2={width - paddingX} y2={(height - paddingY + paddingY) / 2} stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4 4" />
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="var(--border-color)" strokeWidth="1.5" />

          {/* Area under the line */}
          {areaD && <path d={areaD} fill="url(#chartGradient)" />}

          {/* Core line */}
          {pathD && <path d={pathD} fill="none" stroke="var(--primary-color)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}

          {/* Point Markers */}
          {points.map((p, idx) => (
            <g key={idx} className="chart-dot-group">
              <circle cx={p.x} cy={p.y} r="5" fill="var(--primary-color)" stroke="var(--bg-card)" strokeWidth="2" />
              <circle cx={p.x} cy={p.y} r="8" fill="var(--primary-color)" opacity="0" className="interactive-dot" style={{ cursor: 'pointer' }}>
                <title>{`${p.label}: Score ${p.score}`}</title>
              </circle>
            </g>
          ))}
          
          {/* X axis labels */}
          {points.map((p, idx) => {
            if (idx === 0 || idx === points.length - 1 || points.length <= 5) {
              return (
                <text 
                  key={idx} 
                  x={p.x} 
                  y={height - 5} 
                  fontSize="8.5" 
                  fill="var(--text-secondary)" 
                  textAnchor="middle"
                  fontWeight="600"
                >
                  {p.label.length > 12 ? p.label.substring(0, 10) + '..' : p.label}
                </text>
              );
            }
            return null;
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className="container anim-fade-in" style={{ paddingBottom: '4rem' }}>
      {/* Top Banner section */}
      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div className="profile-avatar-container" style={{ margin: 0, width: '70px', height: '70px', fontSize: '2.2rem' }}>
            {AVATARS[user.avatar] || '🧠'}
          </div>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Welcome back, {user.username}!</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Ready to set some new high scores today?</p>
          </div>
        </div>
        <button 
          onClick={() => navigateTo('quizzes')} 
          className="btn btn-primary btn-hover-grow"
          style={{ borderRadius: 'var(--radius-md)' }}
        >
          <Play size={18} />
          Browse Active Quizzes
        </button>
      </div>

      {/* Stats Widgets */}
      <div className="stats-row">
        <div className="stat-widget glass-panel">
          <div className="stat-icon-wrapper">
            <Activity size={24} />
          </div>
          <div className="stat-details">
            <h4>Total Attempts</h4>
            <span>{summary.totalAttempts}</span>
          </div>
        </div>

        <div className="stat-widget glass-panel">
          <div className="stat-icon-wrapper" style={{ color: 'var(--success-color)', background: 'hsla(142, 70%, 42%, 0.08)' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-details">
            <h4>Passed Quizzes</h4>
            <span>{summary.totalPassed}</span>
          </div>
        </div>

        <div className="stat-widget glass-panel">
          <div className="stat-icon-wrapper" style={{ color: 'var(--secondary-color)', background: 'hsla(180, 75%, 45%, 0.08)' }}>
            <Percent size={24} />
          </div>
          <div className="stat-details">
            <h4>Avg. Pass Rate</h4>
            <span>{summary.passRate}%</span>
          </div>
        </div>

        <div className="stat-widget glass-panel">
          <div className="stat-icon-wrapper" style={{ color: 'var(--warning-color)', background: 'hsla(45, 90%, 45%, 0.08)' }}>
            <Trophy size={24} />
          </div>
          <div className="stat-details">
            <h4>Highest Score</h4>
            <span>{summary.highestScore}</span>
          </div>
        </div>
      </div>

      {/* Dashboard Grid split layout */}
      <div className="dashboard-grid">
        {/* Left Column - History & Trends */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Trend Chart */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} style={{ color: 'var(--primary-color)' }} />
              Performance Score Timeline
            </h3>
            {renderTrendChart()}
          </div>

          {/* Attempts History */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div className="panel-header">
              <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={18} style={{ color: 'var(--primary-color)' }} />
                Recent Attempts History
              </h3>
            </div>

            {history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-light)', fontStyle: 'italic' }}>
                You have not completed any quizzes yet. Start one today!
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Assessment Title</th>
                      <th>Questions</th>
                      <th>Correct</th>
                      <th>Score Achieved</th>
                      <th>Status</th>
                      <th>Review</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((hist) => (
                      <tr key={hist.id}>
                        <td style={{ fontWeight: 600 }}>{hist.quiz_title}</td>
                        <td>{hist.total_questions}</td>
                        <td style={{ color: 'var(--success-color)', fontWeight: 600 }}>
                          {hist.correct_answers} <span style={{ color: 'var(--text-light)', fontSize: '0.8rem', fontWeight: 400 }}>/{hist.total_questions}</span>
                        </td>
                        <td style={{ fontWeight: 700 }}>{parseFloat(hist.score).toFixed(1)}</td>
                        <td>
                          <span className={`badge-status ${hist.passed ? 'pass' : 'fail'}`}>
                            {hist.passed ? 'PASSED' : 'FAILED'}
                          </span>
                        </td>
                        <td>
                          <button 
                            onClick={() => navigateTo('result', { attemptId: hist.attempt_id })} 
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                          >
                            Review Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Recommended/Available Subjects Progress */}
        <div className="glass-panel sidebar-panel" style={{ height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Trophy size={18} style={{ color: 'var(--secondary-color)' }} />
            Curriculum Progress
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {quizProgress.map((prog) => (
              <div 
                key={prog.quiz_id} 
                style={{ 
                  border: '1px solid var(--border-color)', 
                  borderRadius: 'var(--radius-md)', 
                  padding: '1rem',
                  background: 'var(--bg-input)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>{prog.quiz_title}</h4>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: prog.highest_score !== null ? 'var(--success-color)' : 'var(--text-light)' }}>
                    {prog.highest_score !== null ? `BEST: ${prog.highest_score}` : 'UNATTEMPTED'}
                  </span>
                </div>
                
                {/* Progress bar background */}
                <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '100px', overflow: 'hidden', position: 'relative', marginBottom: '0.5rem' }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      background: prog.has_passed ? 'var(--success-color)' : 'var(--primary-color)', 
                      width: prog.highest_score !== null ? `${Math.min((parseFloat(prog.highest_score) / (4.0 * 5.0)) * 100, 100)}%` : '0%' // Max score estimate
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>Attempts: {prog.attempts_count || 0}</span>
                  {prog.highest_score !== null ? (
                    <span style={{ fontWeight: 600, color: prog.has_passed ? 'var(--success-color)' : 'var(--danger-color)' }}>
                      {prog.has_passed ? 'PAST PASS' : 'FAILED'}
                    </span>
                  ) : (
                    <button 
                      onClick={() => navigateTo('quizzes')} 
                      style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Start Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
export { AVATARS };
