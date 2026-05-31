import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Search, Clock, Percent, ShieldAlert, Award, ChevronLeft, ChevronRight } from 'lucide-react';

export default function QuizList({ navigateTo }) {
  const [quizzes, setQuizzes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const quizzesPerPage = 6;

  useEffect(() => {
    async function loadQuizzes() {
      setLoading(true);
      const res = await api.getQuizzes(search, true); // Get active quizzes only for users
      if (res.success) {
        setQuizzes(res.quizzes);
      }
      setLoading(false);
      setCurrentPage(1); // Reset page on new searches
    }
    
    // Quick debounce for search input
    const delay = setTimeout(loadQuizzes, 300);
    return () => clearTimeout(delay);
  }, [search]);

  // Pagination calculation
  const indexOfLastQuiz = currentPage * quizzesPerPage;
  const indexOfFirstQuiz = indexOfLastQuiz - quizzesPerPage;
  const currentQuizzes = quizzes.slice(indexOfFirstQuiz, indexOfLastQuiz);
  const totalPages = Math.ceil(quizzes.length / quizzesPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container anim-fade-in" style={{ paddingBottom: '4rem' }}>
      <div className="auth-header" style={{ marginBottom: '2.5rem', textAlign: 'left' }}>
        <h2 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Available Assessments</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Select a subject challenge below to test your professional expertise.</p>
      </div>

      {/* Search and Filters Bar */}
      <div className="search-filter-bar">
        <div className="search-input-wrapper glass-panel" style={{ border: 'none', background: 'var(--bg-card)' }}>
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search quizzes by title or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
              border: 'none', 
              background: 'transparent', 
              paddingLeft: '2.75rem',
              height: '48px',
              borderRadius: 'var(--radius-md)'
            }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div className="spinner"></div>
          <p>Scanning curriculum database...</p>
        </div>
      ) : quizzes.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <span style={{ fontSize: '3rem' }}>🔍</span>
          <h3 style={{ fontSize: '1.25rem', marginTop: '1rem', marginBottom: '0.5rem' }}>No Quizzes Found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>We couldn't find any assessments matching your query. Try broadening your keywords!</p>
        </div>
      ) : (
        <>
          {/* Quizzes Cards Grid */}
          <div className="quiz-grid">
            {currentQuizzes.map((quiz) => (
              <div key={quiz.id} className="quiz-card glass-panel card-hover-expand anim-zoom-in">
                <div className="quiz-card-header">
                  <span className="quiz-badge">
                    {quiz.question_count || 0} Questions
                  </span>
                  <span className="quiz-badge active-badge">
                    Active
                  </span>
                </div>
                <h3>{quiz.title}</h3>
                <p>{quiz.description || 'No description provided.'}</p>
                
                {/* Meta details list */}
                <div className="quiz-meta-row">
                  <div className="quiz-meta-item" title="Assessment timer duration">
                    <Clock size={16} style={{ color: 'var(--primary-color)' }} />
                    <span>{quiz.duration_minutes} mins</span>
                  </div>
                  <div className="quiz-meta-item" title="Passing Score Percentage Required">
                    <Percent size={16} style={{ color: 'var(--success-color)' }} />
                    <span>{quiz.passing_score}% Pass</span>
                  </div>
                  <div className="quiz-meta-item" title="Negative marking parameters">
                    <ShieldAlert size={16} style={{ color: quiz.negative_points > 0 ? 'var(--danger-color)' : 'var(--text-light)' }} />
                    <span>
                      {quiz.negative_points > 0 ? `-${quiz.negative_points} Neg` : 'No Penalty'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button 
                    onClick={() => navigateTo('attempt', { quizId: quiz.id })} 
                    className="btn btn-primary btn-hover-grow"
                    style={{ flex: 1, padding: '0.7rem', borderRadius: 'var(--radius-md)' }}
                  >
                    Start Assessment
                  </button>
                  <button 
                    onClick={() => navigateTo('leaderboard', { quizId: quiz.id })} 
                    className="btn btn-secondary btn-icon-only"
                    title="View Quiz Leaderboard"
                    style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)' }}
                  >
                    <Award size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                className="page-btn"
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
              </button>
              
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((num) => (
                <button 
                  key={num}
                  onClick={() => handlePageChange(num)}
                  className={`page-btn ${currentPage === num ? 'active' : ''}`}
                >
                  {num}
                </button>
              ))}

              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                className="page-btn"
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
