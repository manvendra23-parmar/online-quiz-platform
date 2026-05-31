import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, Trophy, ChevronLeft } from 'lucide-react';

export default function Result({ navigateTo, params }) {
  const { attemptId } = params || {};
  
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(null);
  const [result, setResult] = useState(null);
  const [review, setReview] = useState([]);

  useEffect(() => {
    if (!attemptId) {
      navigateTo('dashboard');
      return;
    }

    async function loadResultData() {
      try {
        const res = await api.getAttemptReview(attemptId);
        if (res.success) {
          setAttempt(res.attempt);
          setResult(res.result);
          setReview(res.review);
        } else {
          alert('Failed to load assessment review.');
          navigateTo('dashboard');
        }
      } catch (err) {
        console.error('Failed to fetch result review:', err);
        navigateTo('dashboard');
      } finally {
        setLoading(false);
      }
    }

    loadResultData();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="container anim-fade-in" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <div className="spinner"></div>
        <p>Analyzing quiz answers and compiling scores...</p>
      </div>
    );
  }

  if (!result) return <p>Result details could not be retrieved.</p>;

  // Compile calculations
  const maxPossible = result.total_questions * 10; // Max points baseline (e.g. 10 per q)
  const scorePercent = maxPossible > 0 ? (result.score / maxPossible) * 100 : 0;
  const roundedPercent = scorePercent.toFixed(1);
  const displayScore = parseFloat(result.score).toFixed(1);

  // SVG Gauge calculations
  const radius = 80;
  const strokeDash = 2 * Math.PI * radius;
  const gaugePercent = Math.max(0, Math.min(scorePercent, 100));
  const strokeOffset = strokeDash - (gaugePercent / 100) * strokeDash;

  return (
    <div className="container anim-fade-in" style={{ paddingBottom: '4rem' }}>
      
      {/* Top action row */}
      <button 
        onClick={() => navigateTo('dashboard')} 
        className="btn btn-secondary"
        style={{ marginBottom: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
      >
        <ChevronLeft size={16} />
        Back to Dashboard
      </button>

      {/* Main Score Board Panel */}
      <div className="glass-panel result-container anim-zoom-in">
        {/* Animated Percentage circular gauge */}
        <div className="result-gauge-wrapper">
          <svg className="timer-svg" width="200" height="200">
            <circle className="timer-bg-circle" cx="100" cy="100" r={radius} strokeWidth="10" />
            <circle 
              cx="100" 
              cy="100" 
              r={radius} 
              strokeWidth="10"
              strokeLinecap="round"
              stroke={result.passed ? 'var(--success-color)' : 'var(--danger-color)'}
              fill="none"
              style={{
                transform: 'rotate(-90deg)',
                transformOrigin: '50% 50%',
                strokeDasharray: strokeDash,
                strokeDashoffset: strokeOffset,
                transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            />
          </svg>
          <div className="result-gauge-text">
            <div className="result-gauge-number">{roundedPercent}%</div>
            <div className="result-gauge-lbl">SCORE</div>
          </div>
        </div>

        {/* Passed/Failed Title Banner */}
        <h2 className={`result-status-title ${result.passed ? 'pass-status' : 'fail-status'}`}>
          {result.passed ? 'Assessment Passed! 🎉' : 'Assessment Failed ⚠️'}
        </h2>

        <p className="result-explanation-banner">
          You attempted the <strong>{attempt?.quiz_title}</strong>. 
          You scored <strong>{displayScore} points</strong> with a pass threshold of {roundedPercent}%.
        </p>

        {/* Small stats badges row */}
        <div className="stats-row" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="stat-widget glass-panel" style={{ padding: '1rem', background: 'var(--bg-input)' }}>
            <div className="stat-details">
              <h4>Correct Answers</h4>
              <span style={{ color: 'var(--success-color)' }}>{result.correct_answers}</span>
            </div>
          </div>
          <div className="stat-widget glass-panel" style={{ padding: '1rem', background: 'var(--bg-input)' }}>
            <div className="stat-details">
              <h4>Incorrect Answers</h4>
              <span style={{ color: 'var(--danger-color)' }}>{result.incorrect_answers}</span>
            </div>
          </div>
          <div className="stat-widget glass-panel" style={{ padding: '1rem', background: 'var(--bg-input)' }}>
            <div className="stat-details">
              <h4>Skipped Questions</h4>
              <span>{result.total_questions - result.correct_answers - result.incorrect_answers}</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
            onClick={() => navigateTo('quizzes')} 
            className="btn btn-primary btn-hover-grow"
          >
            <RefreshCw size={18} />
            Try Another Quiz
          </button>
          <button 
            onClick={() => navigateTo('leaderboard', { quizId: attempt?.quiz_id })} 
            className="btn btn-secondary btn-hover-grow"
          >
            <Trophy size={18} />
            View Leaderboard
          </button>
        </div>
      </div>

      {/* Questions Review list */}
      <div className="review-section">
        <h3 className="review-title">Detailed Question Review</h3>
        
        {review.map((q, idx) => {
          const isCorrect = q.is_correct === 1;
          const isSkipped = !q.selected_option;
          
          let cardBorderColor = 'var(--border-color)';
          if (isCorrect) cardBorderColor = 'var(--success-color)';
          else if (!isSkipped) cardBorderColor = 'var(--danger-color)';

          return (
            <div 
              key={q.id} 
              className="glass-panel review-card"
              style={{ borderLeft: `6px solid ${cardBorderColor}` }}
            >
              <div className="review-card-header">
                <span style={{ fontWeight: 800, color: 'var(--text-secondary)' }}>
                  Question {idx + 1}
                </span>

                {isCorrect ? (
                  <span className="badge-review correct">
                    <CheckCircle2 size={12} /> Correct
                  </span>
                ) : isSkipped ? (
                  <span className="badge-review skipped">
                    <AlertCircle size={12} /> Skipped
                  </span>
                ) : (
                  <span className="badge-review incorrect">
                    <XCircle size={12} /> Incorrect
                  </span>
                )}
              </div>

              <h4 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '1.5rem', lineHeight: '1.4' }}>
                {q.question_text}
              </h4>

              {/* Options */}
              <div className="options-list" style={{ marginBottom: '1.5rem' }}>
                {['A', 'B', 'C', 'D'].map((opt) => {
                  const optField = `option_${opt.toLowerCase()}`;
                  const isUserSelection = q.selected_option === opt;
                  const isCorrectOption = q.correct_option === opt;
                  
                  let optionClass = 'review-option';
                  if (isCorrectOption) {
                    optionClass += ' correct-option-block';
                  } else if (isUserSelection && !isCorrectOption) {
                    optionClass += ' incorrect-option-block';
                  }

                  return (
                    <div key={opt} className={optionClass}>
                      <div 
                        className="option-letter" 
                        style={{
                          backgroundColor: isCorrectOption ? 'var(--success-color)' : isUserSelection ? 'var(--danger-color)' : 'var(--border-color)',
                          color: '#ffffff'
                        }}
                      >
                        {opt}
                      </div>
                      <div className="option-text" style={{ fontWeight: isCorrectOption || isUserSelection ? 600 : 400 }}>
                        {q[optField]}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pedagogy: Explanation box */}
              {q.explanation && (
                <div className="review-explanation anim-fade-in">
                  <h4>Explanatory Reference</h4>
                  <p>{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
