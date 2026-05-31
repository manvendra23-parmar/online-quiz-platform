import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Trophy, Award, Users, ChevronRight, ListFilter } from 'lucide-react';
import { AVATARS } from './UserDashboard';

export default function Leaderboard({ navigateTo, params }) {
  const initialQuizId = params?.quizId || '';
  
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(initialQuizId);
  const [rankings, setRankings] = useState([]);
  const [globalMode, setGlobalMode] = useState(!initialQuizId);
  const [loading, setLoading] = useState(true);

  // 1. Fetch available quizzes list on mount
  useEffect(() => {
    async function loadQuizzes() {
      const res = await api.getQuizzes('', true);
      if (res.success && res.quizzes.length > 0) {
        setQuizzes(res.quizzes);
        // If no initial quiz ID was passed and we are not in global mode, select first quiz
        if (!initialQuizId && !globalMode) {
          setSelectedQuiz(res.quizzes[0].id);
        }
      }
    }
    loadQuizzes();
  }, [initialQuizId]);

  // 2. Fetch Leaderboard based on parameters
  useEffect(() => {
    async function fetchRankings() {
      setLoading(true);
      try {
        if (globalMode) {
          const res = await api.getGlobalLeaderboard();
          if (res.success) setRankings(res.leaderboard);
        } else if (selectedQuiz) {
          const res = await api.getQuizLeaderboard(selectedQuiz);
          if (res.success) setRankings(res.leaderboard);
        }
      } catch (err) {
        console.error('Leaderboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchRankings();
  }, [globalMode, selectedQuiz]);

  const handleToggleGlobal = (isGlobal) => {
    setGlobalMode(isGlobal);
    if (!isGlobal && quizzes.length > 0 && !selectedQuiz) {
      setSelectedQuiz(quizzes[0].id);
    }
  };

  // Extract Podium participants
  const firstPlace = rankings.find(r => r.rank === 1);
  const secondPlace = rankings.find(r => r.rank === 2);
  const thirdPlace = rankings.find(r => r.rank === 3);
  const runnersUp = rankings.filter(r => r.rank > 3);

  return (
    <div className="container anim-fade-in" style={{ paddingBottom: '4rem' }}>
      
      {/* Header Info */}
      <div className="auth-header" style={{ marginBottom: '2.5rem', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Competitive Leaderboard</h2>
          <p style={{ color: 'var(--text-secondary)' }}>See how you stack up against other academic and technical candidates.</p>
        </div>
        
        {/* Toggle buttons between Global and Quiz specific */}
        <div className="glass-panel" style={{ display: 'flex', gap: '0.25rem', padding: '0.35rem', borderRadius: 'var(--radius-md)' }}>
          <button 
            onClick={() => handleToggleGlobal(true)}
            className={`btn ${globalMode ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem', padding: '0.4rem 1rem', border: 'none', borderRadius: 'var(--radius-sm)' }}
          >
            <Users size={16} />
            Global Standings
          </button>
          <button 
            onClick={() => handleToggleGlobal(false)}
            className={`btn ${!globalMode ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem', padding: '0.4rem 1rem', border: 'none', borderRadius: 'var(--radius-sm)' }}
          >
            <Award size={16} />
            Per-Quiz Rankings
          </button>
        </div>
      </div>

      {/* Quiz Selector dropdown (Active when in Quiz Rankings mode) */}
      {!globalMode && quizzes.length > 0 && (
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '2rem' }}>
          <ListFilter size={18} style={{ color: 'var(--primary-color)' }} />
          <select 
            value={selectedQuiz} 
            onChange={(e) => setSelectedQuiz(e.target.value)}
            className="form-input"
            style={{ width: 'auto', minWidth: '240px', height: '42px', borderRadius: 'var(--radius-md)', padding: '0.5rem 1rem' }}
          >
            {quizzes.map(q => (
              <option key={q.id} value={q.id}>{q.title}</option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div className="spinner"></div>
          <p>Compiling database rankings...</p>
        </div>
      ) : rankings.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <span style={{ fontSize: '3rem' }}>🏆</span>
          <h3 style={{ fontSize: '1.25rem', marginTop: '1rem', marginBottom: '0.5rem' }}>No Rankings Available</h3>
          <p style={{ color: 'var(--text-secondary)' }}>No candidates have successfully attempted this assessment yet. Be the first to secure a rank!</p>
        </div>
      ) : (
        <>
          {/* Beautiful Gold/Silver/Bronze podium */}
          <div className="podium-container anim-zoom-in">
            {/* 2nd Place (Left) */}
            <div className="podium-step second">
              {secondPlace ? (
                <>
                  <div className="podium-avatar">{AVATARS[secondPlace.avatar] || '🧠'}</div>
                  <div className="podium-name">{secondPlace.username}</div>
                  <div className="podium-score">
                    {globalMode ? `${secondPlace.total_score} pts` : `${parseFloat(secondPlace.highest_score).toFixed(1)}`}
                  </div>
                </>
              ) : <div style={{ height: '80px' }} />}
              <div className="podium-pedestal">
                <span className="podium-rank">2</span>
              </div>
            </div>

            {/* 1st Place (Center - Taller) */}
            <div className="podium-step first">
              {firstPlace ? (
                <>
                  <div className="podium-avatar">{AVATARS[firstPlace.avatar] || '🧠'}</div>
                  <div className="podium-name">{firstPlace.username}</div>
                  <div className="podium-score">
                    {globalMode ? `${firstPlace.total_score} pts` : `${parseFloat(firstPlace.highest_score).toFixed(1)}`}
                  </div>
                </>
              ) : <div style={{ height: '90px' }} />}
              <div className="podium-pedestal">
                <span className="podium-rank">1</span>
              </div>
            </div>

            {/* 3rd Place (Right) */}
            <div className="podium-step third">
              {thirdPlace ? (
                <>
                  <div className="podium-avatar">{AVATARS[thirdPlace.avatar] || '🧠'}</div>
                  <div className="podium-name">{thirdPlace.username}</div>
                  <div className="podium-score">
                    {globalMode ? `${thirdPlace.total_score} pts` : `${parseFloat(thirdPlace.highest_score).toFixed(1)}`}
                  </div>
                </>
              ) : <div style={{ height: '70px' }} />}
              <div className="podium-pedestal">
                <span className="podium-rank">3</span>
              </div>
            </div>
          </div>

          {/* Runners Up Table */}
          {runnersUp.length > 0 && (
            <div className="glass-panel anim-slide-up" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trophy size={18} style={{ color: 'var(--primary-color)' }} />
                Rankings Standings
              </h3>
              
              <div className="table-wrapper">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }}>Rank</th>
                      <th>Candidate Name</th>
                      <th>Attempts Count</th>
                      <th style={{ textAlign: 'right' }}>Top Score Achieved</th>
                    </tr>
                  </thead>
                  <tbody>
                    {runnersUp.map((r) => (
                      <tr key={r.user_id}>
                        <td style={{ fontWeight: 800, color: 'var(--text-secondary)' }}>
                          #{r.rank}
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          <span style={{ marginRight: '0.5rem', fontSize: '1.2rem' }}>{AVATARS[r.avatar] || '🧠'}</span>
                          {r.username}
                        </td>
                        <td>{r.total_attempts}</td>
                        <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--primary-color)' }}>
                          {globalMode ? `${r.total_score.toFixed(1)} points` : parseFloat(r.highest_score).toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
