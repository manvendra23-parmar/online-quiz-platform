import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { Clock, Flag, ChevronLeft, ChevronRight, Save, CheckSquare } from 'lucide-react';

export default function QuizAttempt({ navigateTo, params }) {
  const { quizId } = params || {};
  
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attemptId, setAttemptId] = useState(null);
  
  // Quiz taking state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: selectedOption }
  const [flagged, setFlagged] = useState({}); // { questionId: boolean }
  const [savingState, setSavingState] = useState(''); // 'saving', 'saved', 'error'
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);
  const totalDurationRef = useRef(0);

  // 1. Initialise Quiz and Attempt
  useEffect(() => {
    if (!quizId) {
      navigateTo('quizzes');
      return;
    }

    async function startQuizSession() {
      try {
        // Fetch Quiz details (Anti-cheat blocks answers and explanations from this payload!)
        const detailsRes = await api.getQuizDetails(quizId);
        if (!detailsRes.success) {
          alert('Failed to load quiz details.');
          navigateTo('quizzes');
          return;
        }
        
        setQuiz(detailsRes.quiz);
        setQuestions(detailsRes.questions);
        
        // Start or resume API attempt session
        const attemptRes = await api.startAttempt(quizId);
        if (!attemptRes.success) {
          alert(attemptRes.message || 'Failed to start quiz session.');
          navigateTo('quizzes');
          return;
        }

        setAttemptId(attemptRes.attemptId);
        setTimeLeft(attemptRes.timeRemainingSeconds);
        totalDurationRef.current = detailsRes.quiz.duration_minutes * 60;
        
        // If resuming, fetch review details or saved answers if possible
        // To simplify, if they resume, we can pre-populate from database review or attempts log
        // Let's check if there are answers they had saved previously
        const reviewRes = await api.getAttemptReview(attemptRes.attemptId);
        if (reviewRes.success && reviewRes.review) {
          const preSavedAnswers = {};
          reviewRes.review.forEach(q => {
            if (q.selected_option) {
              preSavedAnswers[q.id] = q.selected_option;
            }
          });
          setAnswers(preSavedAnswers);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Quiz attempt session setup error:', err);
        navigateTo('quizzes');
      }
    }

    startQuizSession();
  }, [quizId]);

  // 2. Timer Countdown Clock Engine
  useEffect(() => {
    if (loading || timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit(); // submit when time runs out!
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [loading, timeLeft]);

  // 3. Save User Option Selection (Auto-save)
  const handleSelectOption = async (optionLetter) => {
    const activeQuestion = questions[currentIndex];
    if (!activeQuestion) return;

    // Update local state first for instant lag-free UI
    const updatedAnswers = { ...answers, [activeQuestion.id]: optionLetter };
    setAnswers(updatedAnswers);
    
    // Trigger backend auto-save API
    setSavingState('saving');
    try {
      const res = await api.saveAnswer(attemptId, activeQuestion.id, optionLetter);
      if (res.success) {
        setSavingState('saved');
        // Clear saved indicator after 1.5s
        setTimeout(() => setSavingState(prev => prev === 'saved' ? '' : prev), 1500);
      } else {
        setSavingState('error');
      }
    } catch (err) {
      setSavingState('error');
    }
  };

  const handleToggleFlag = () => {
    const activeQuestion = questions[currentIndex];
    if (!activeQuestion) return;
    
    setFlagged(prev => ({
      ...prev,
      [activeQuestion.id]: !prev[activeQuestion.id]
    }));
  };

  // 4. Submit Attempt Actions
  const handleSubmit = async () => {
    if (window.confirm('Are you sure you want to finish and submit your quiz answers?')) {
      await executeSubmission();
    }
  };

  const handleAutoSubmit = async () => {
    alert('Time limit reached! Your quiz will be automatically submitted.');
    await executeSubmission();
  };

  const executeSubmission = async () => {
    clearInterval(timerRef.current);
    setLoading(true);
    try {
      const res = await api.submitAttempt(attemptId);
      if (res.success) {
        // Redirect to result details page
        navigateTo('result', { attemptId });
      } else {
        alert('Failed to submit quiz. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Submission error:', err);
      alert('Network error submitting quiz.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container anim-fade-in" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <div className="spinner"></div>
        <p>Loading secure exam interface...</p>
      </div>
    );
  }

  const activeQuestion = questions[currentIndex];
  const isAnswered = activeQuestion && answers[activeQuestion.id] !== undefined;
  
  // Format seconds to MM:SS
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Calculate SVG circular stroke parameters
  const percentTimeLeft = totalDurationRef.current > 0 ? (timeLeft / totalDurationRef.current) * 100 : 100;
  const strokeDash = 2 * Math.PI * 55; // Circle radius 55
  const strokeOffset = strokeDash - (percentTimeLeft / 100) * strokeDash;

  // Determine timer threat levels color
  let timeColorClass = 'time-green';
  if (percentTimeLeft <= 20) {
    timeColorClass = 'time-red';
  } else if (percentTimeLeft <= 50) {
    timeColorClass = 'time-orange';
  }

  return (
    <div className="container anim-fade-in" style={{ paddingBottom: '4rem' }}>
      <div className="quiz-layout">
        {/* Left Column: Active Question Block */}
        <div className="glass-panel question-panel">
          <div className="question-header">
            <span className="question-number">
              QUESTION {currentIndex + 1} OF {questions.length}
            </span>
            
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              {savingState === 'saving' && <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Syncing answers...</span>}
              {savingState === 'saved' && <span style={{ fontSize: '0.85rem', color: 'var(--success-color)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Save size={14}/> Saved</span>}
              {savingState === 'error' && <span style={{ fontSize: '0.85rem', color: 'var(--danger-color)' }}>Save failed! Retrying...</span>}
              
              <button 
                onClick={handleToggleFlag} 
                className={`flag-btn ${flagged[activeQuestion?.id] ? 'active' : ''}`}
              >
                <Flag size={14} />
                <span>Flag</span>
              </button>
            </div>
          </div>

          {activeQuestion ? (
            <>
              <h2 className="question-text">{activeQuestion.question_text}</h2>
              
              <div className="options-list">
                {['A', 'B', 'C', 'D'].map((opt) => {
                  const optField = `option_${opt.toLowerCase()}`;
                  const isSelected = answers[activeQuestion.id] === opt;
                  
                  return (
                    <div 
                      key={opt}
                      className={`option-block ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectOption(opt)}
                    >
                      <div className="option-letter">{opt}</div>
                      <div className="option-text">{activeQuestion[optField]}</div>
                    </div>
                  );
                })}
              </div>

              {/* Navigation control row */}
              <div className="quiz-actions">
                <button 
                  onClick={() => setCurrentIndex(prev => Math.max(prev - 1, 0))}
                  className="btn btn-secondary"
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft size={18} />
                  Previous
                </button>

                {currentIndex < questions.length - 1 ? (
                  <button 
                    onClick={() => setCurrentIndex(prev => Math.min(prev + 1, questions.length - 1))}
                    className="btn btn-secondary"
                  >
                    Next
                    <ChevronRight size={18} />
                  </button>
                ) : (
                  <button 
                    onClick={handleSubmit}
                    className="btn btn-primary btn-hover-grow"
                    style={{ background: 'var(--success-color)' }}
                  >
                    <CheckSquare size={18} />
                    Submit Assessment
                  </button>
                )}
              </div>
            </>
          ) : (
            <p>No questions found for this quiz.</p>
          )}
        </div>

        {/* Right Column: Quiz Session Sidebar Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Circular Countdown widget */}
          <div className="glass-panel sidebar-panel timer-container">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Remaining Time</h3>
            <div className="timer-svg-wrapper">
              <svg className="timer-svg" width="140" height="140">
                <circle className="timer-bg-circle" cx="70" cy="70" r="55" />
                <circle 
                  className={`timer-progress-circle ${timeColorClass}`} 
                  cx="70" 
                  cy="70" 
                  r="55" 
                  strokeDasharray={strokeDash}
                  strokeDashoffset={strokeOffset}
                />
              </svg>
              <div className="timer-text" style={{ color: percentTimeLeft <= 20 ? 'var(--danger-color)' : 'var(--text-main)' }}>
                {formatTime(timeLeft)}
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Assessment auto-submits on timeout.
            </p>
          </div>

          {/* Navigator Dot grid tracker */}
          <div className="glass-panel sidebar-panel">
            <h3 className="nav-grid-title">Assessment Navigator</h3>
            
            <div className="navigator-grid">
              {questions.map((q, idx) => {
                const isCurrent = currentIndex === idx;
                const hasAnswered = answers[q.id] !== undefined;
                const isFlagged = flagged[q.id] === true;
                
                let dotClass = '';
                if (isCurrent) dotClass = 'current';
                else if (isFlagged) dotClass = 'flagged';
                else if (hasAnswered) dotClass = 'answered';
                
                return (
                  <div 
                    key={q.id}
                    className={`navigator-dot ${dotClass}`}
                    onClick={() => setCurrentIndex(idx)}
                  >
                    {idx + 1}
                  </div>
                );
              })}
            </div>

            <div className="navigator-stats">
              {Object.keys(answers).length} of {questions.length} Questions Answered
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
