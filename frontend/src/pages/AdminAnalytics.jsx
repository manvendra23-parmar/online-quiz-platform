import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Users, 
  HelpCircle, 
  Activity, 
  TrendingUp, 
  CheckCircle, 
  Minus, 
  Sparkles,
  RefreshCw
} from 'lucide-react';

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadAnalytics() {
    setLoading(true);
    try {
      const res = await api.getAdminAnalytics();
      if (res.success) {
        setAnalytics(res);
      }
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="container anim-fade-in" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <div className="spinner"></div>
        <p>Retrieving system database metrics...</p>
      </div>
    );
  }

  const { stats, quizBreakdown, recentActivity } = analytics || {
    stats: { totalUsers: 0, totalQuizzes: 0, totalAttempts: 0, avgScore: '0.0', highestScore: '0.0', lowestScore: '0.0' },
    quizBreakdown: [],
    recentActivity: []
  };

  // Custom SVG Bar Chart showing Average Score per Quiz
  const renderQuizAveragesChart = () => {
    if (!quizBreakdown || quizBreakdown.length === 0) {
      return <p style={{ fontStyle: 'italic', textAlign: 'center', color: 'var(--text-light)', padding: '2rem 0' }}>No quiz data to plot.</p>;
    }

    const width = 500;
    const height = 200;
    const paddingX = 40;
    const paddingY = 30;
    
    // Max score is 50 for layout points
    const maxVal = 50; 
    
    const barWidth = 35;
    const gap = (width - 2 * paddingX - quizBreakdown.length * barWidth) / Math.max(quizBreakdown.length - 1, 1);

    return (
      <div className="chart-container" style={{ marginTop: '1rem' }}>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
          {/* Grid lines */}
          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4 4" />
          <line x1={paddingX} y1={(height - paddingY + paddingY) / 2} x2={width - paddingX} y2={(height - paddingY + paddingY) / 2} stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4 4" />
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="var(--border-color)" strokeWidth="1.5" />

          {/* Draw bars */}
          {quizBreakdown.map((q, idx) => {
            const avg = parseFloat(q.average_score || '0');
            const barHeight = (avg / maxVal) * (height - 2 * paddingY);
            const x = paddingX + idx * (barWidth + gap);
            const y = height - paddingY - barHeight;

            return (
              <g key={q.id}>
                {/* Visual bar */}
                <rect 
                  x={x} 
                  y={y} 
                  width={barWidth} 
                  height={Math.max(barHeight, 2)} 
                  className="chart-bar"
                  title={`${q.title}: Avg. Score ${avg}`}
                />
                
                {/* Score badge text inside bar */}
                {barHeight > 18 && (
                  <text 
                    x={x + barWidth / 2} 
                    y={y + 14} 
                    fill="#ffffff" 
                    fontSize="9.5" 
                    fontWeight="700" 
                    textAnchor="middle"
                  >
                    {Math.round(avg)}
                  </text>
                )}

                {/* X labels */}
                <text 
                  x={x + barWidth / 2} 
                  y={height - 10} 
                  fontSize="8.5" 
                  fill="var(--text-secondary)" 
                  textAnchor="middle"
                  fontWeight="600"
                >
                  {q.title.length > 8 ? q.title.substring(0, 7) + '..' : q.title}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className="container anim-fade-in" style={{ paddingBottom: '4rem' }}>
      
      {/* Action Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={18} style={{ color: 'var(--primary-color)' }} />
          System Analytics Dashboard
        </h3>
        <button onClick={loadAnalytics} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
          <RefreshCw size={14} />
          Reload Data
        </button>
      </div>

      {/* Stats Widgets grid */}
      <div className="stats-row">
        <div className="stat-widget glass-panel">
          <div className="stat-icon-wrapper">
            <Users size={24} />
          </div>
          <div className="stat-details">
            <h4>Total Students</h4>
            <span>{stats.totalUsers}</span>
          </div>
        </div>

        <div className="stat-widget glass-panel">
          <div className="stat-icon-wrapper" style={{ color: 'var(--secondary-color)', background: 'hsla(180, 75%, 45%, 0.08)' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-details">
            <h4>Exam Attempts</h4>
            <span>{stats.totalAttempts}</span>
          </div>
        </div>

        <div className="stat-widget glass-panel">
          <div className="stat-icon-wrapper" style={{ color: 'var(--success-color)', background: 'hsla(142, 70%, 42%, 0.08)' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-details">
            <h4>Average Score</h4>
            <span>{stats.avgScore}</span>
          </div>
        </div>

        <div className="stat-widget glass-panel">
          <div className="stat-icon-wrapper" style={{ color: 'var(--warning-color)', background: 'hsla(45, 90%, 45%, 0.08)' }}>
            <Sparkles size={24} />
          </div>
          <div className="stat-details">
            <h4>Highest Score</h4>
            <span>{stats.highestScore}</span>
          </div>
        </div>
      </div>

      {/* Lower Dashboard Splits Grid */}
      <div className="dashboard-grid">
        
        {/* Left Panel: Quiz Breakdown Table */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Curriculum Subject Breakdown</h3>
          
          <div className="table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Subject Assessment</th>
                  <th>Attempts</th>
                  <th>Average Score</th>
                  <th style={{ textAlign: 'right' }}>Pass Rate</th>
                </tr>
              </thead>
              <tbody>
                {quizBreakdown.map((q) => (
                  <tr key={q.id}>
                    <td style={{ fontWeight: 700 }}>{q.title}</td>
                    <td>{q.total_attempts}</td>
                    <td style={{ fontWeight: 600, color: 'var(--primary-color)' }}>
                      {q.average_score} <span style={{ color: 'var(--text-light)', fontSize: '0.8rem', fontWeight: 400 }}>pts</span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: parseFloat(q.pass_rate) >= 60 ? 'var(--success-color)' : 'var(--warning-color)' }}>
                      {q.pass_rate !== 'NaN' ? `${q.pass_rate}%` : '0%'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Panel: Custom SVG Bar Chart */}
        <div className="glass-panel" style={{ padding: '2rem', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Overall Quiz Averages</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Comparative summary of the average scores achieved across each active curriculum subject.
          </p>
          {renderQuizAveragesChart()}
        </div>

      </div>

      {/* Recent Global Attempts Log */}
      <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Recent Student Completed Exams</h3>
        
        {recentActivity.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-light)', fontStyle: 'italic' }}>
            No exams have been completed by students yet.
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Assessment Attempted</th>
                  <th>Score Secured</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Submission Date</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((act) => (
                  <tr key={act.id}>
                    <td style={{ fontWeight: 700 }}>{act.username}</td>
                    <td style={{ fontWeight: 600 }}>{act.quiz_title}</td>
                    <td style={{ fontWeight: 800, color: 'var(--primary-color)' }}>{parseFloat(act.score).toFixed(1)}</td>
                    <td>
                      <span className={`badge-status ${act.passed ? 'pass' : 'fail'}`}>
                        {act.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {new Date(act.end_time).toLocaleDateString()} {new Date(act.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
