import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Upload, 
  BookOpen, 
  HelpCircle, 
  FileSpreadsheet, 
  AlertCircle, 
  Check, 
  ArrowLeft,
  Settings
} from 'lucide-react';

export default function AdminDashboard() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Navigation states
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [selectedQuizTitle, setSelectedQuizTitle] = useState('');
  const [questions, setQuestions] = useState([]);
  
  // Modals
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  
  // Forms states
  const [quizForm, setQuizForm] = useState({
    title: '', description: '', duration_minutes: 30, passing_score: 50, positive_points: 4, negative_points: 1, is_active: true
  });
  
  const [questionForm, setQuestionForm] = useState({
    question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A', explanation: ''
  });

  // CSV file uploader
  const [csvFile, setCsvFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);

  // 1. Fetch available quizzes list
  async function loadQuizzes() {
    setLoading(true);
    const res = await api.getQuizzes('', false); // admin gets all quizzes
    if (res.success) setQuizzes(res.quizzes);
    setLoading(false);
  }

  useEffect(() => {
    loadQuizzes();
  }, []);

  // 2. Manage questions for a specific quiz
  const handleManageQuestions = async (quizId, quizTitle) => {
    setLoading(true);
    setSelectedQuizId(quizId);
    setSelectedQuizTitle(quizTitle);
    
    const res = await api.getQuizDetails(quizId);
    if (res.success) {
      setQuestions(res.questions);
    }
    setLoading(false);
  };

  const handleBackToQuizzes = () => {
    setSelectedQuizId(null);
    setSelectedQuizTitle('');
    setQuestions([]);
    setUploadMessage('');
    setUploadError('');
    loadQuizzes();
  };

  // 3. Quiz CRUD Handlers
  const handleOpenQuizModal = (quiz = null) => {
    if (quiz) {
      setEditingQuiz(quiz);
      setQuizForm({
        title: quiz.title,
        description: quiz.description || '',
        duration_minutes: quiz.duration_minutes,
        passing_score: quiz.passing_score,
        positive_points: quiz.positive_points,
        negative_points: quiz.negative_points,
        is_active: !!quiz.is_active
      });
    } else {
      setEditingQuiz(null);
      setQuizForm({
        title: '', description: '', duration_minutes: 30, passing_score: 50, positive_points: 4, negative_points: 1, is_active: true
      });
    }
    setShowQuizModal(true);
  };

  const handleSaveQuiz = async (e) => {
    e.preventDefault();
    if (!quizForm.title) return alert('Quiz title is required');
    
    let res;
    if (editingQuiz) {
      res = await api.updateQuiz(editingQuiz.id, quizForm);
    } else {
      res = await api.createQuiz(quizForm);
    }
    
    if (res.success) {
      setShowQuizModal(false);
      loadQuizzes();
    } else {
      alert(res.message || 'Error saving quiz');
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('WARNING: Deleting this quiz will permanently remove all associated questions, attempts, and results. Proceed?')) {
      const res = await api.deleteQuiz(quizId);
      if (res.success) loadQuizzes();
      else alert(res.message);
    }
  };

  // 4. Questions CRUD Handlers
  const handleOpenQuestionModal = (question = null) => {
    if (question) {
      setEditingQuestion(question);
      setQuestionForm({
        question_text: question.question_text,
        option_a: question.option_a,
        option_b: question.option_b,
        option_c: question.option_c,
        option_d: question.option_d,
        correct_option: question.correct_option,
        explanation: question.explanation || ''
      });
    } else {
      setEditingQuestion(null);
      setQuestionForm({
        question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A', explanation: ''
      });
    }
    setShowQuestionModal(true);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    const { question_text, option_a, option_b, option_c, option_d } = questionForm;
    if (!question_text || !option_a || !option_b || !option_c || !option_d) {
      return alert('All question fields are required.');
    }
    
    let res;
    if (editingQuestion) {
      res = await api.updateQuestion(editingQuestion.id, questionForm);
    } else {
      res = await api.addQuestion(selectedQuizId, questionForm);
    }
    
    if (res.success) {
      setShowQuestionModal(false);
      handleManageQuestions(selectedQuizId, selectedQuizTitle); // refresh questions
    } else {
      alert(res.message || 'Error saving question');
    }
  };

  const handleDeleteQuestion = async (qId) => {
    if (window.confirm('Delete this question from the quiz?')) {
      const res = await api.deleteQuestion(qId);
      if (res.success) handleManageQuestions(selectedQuizId, selectedQuizTitle);
      else alert(res.message);
    }
  };

  // 5. CSV Bulk Uploader
  const handleCsvUpload = async (e) => {
    e.preventDefault();
    if (!csvFile) return alert('Select a CSV file first');
    
    setUploading(true);
    setUploadMessage('');
    setUploadError('');
    
    const formData = new FormData();
    formData.append('file', csvFile);
    
    try {
      const res = await api.bulkUploadQuestions(selectedQuizId, formData);
      if (res.success) {
        setUploadMessage(res.message || 'CSV questions uploaded successfully!');
        setCsvFile(null);
        handleManageQuestions(selectedQuizId, selectedQuizTitle); // reload questions list
      } else {
        setUploadError(res.message || 'Failed to upload CSV questions');
      }
    } catch (err) {
      setUploadError('Network error uploading CSV file.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container anim-fade-in" style={{ paddingBottom: '4rem' }}>
      
      {/* Dynamic Title Headers */}
      <div className="auth-header" style={{ marginBottom: '2.5rem', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800 }}>
            {selectedQuizId ? `Manage Questions` : `Admin Assessments Manager`}
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            {selectedQuizId ? `Quiz Curriculum: ${selectedQuizTitle}` : `Create, modify, and manage curriculum assessments and questions.`}
          </p>
        </div>
        
        {/* Header action button */}
        {selectedQuizId ? (
          <button onClick={handleBackToQuizzes} className="btn btn-secondary">
            <ArrowLeft size={16} />
            Back to Quizzes List
          </button>
        ) : (
          <button onClick={() => handleOpenQuizModal()} className="btn btn-primary btn-hover-grow">
            <Plus size={18} />
            Create New Quiz
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div className="spinner"></div>
          <p>Connecting to administration vault...</p>
        </div>
      ) : !selectedQuizId ? (
        /* ================= QUIZZES LISTING TABLE ================= */
        <div className="glass-panel" style={{ padding: '2rem' }}>
          {quizzes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-light)', fontStyle: 'italic' }}>
              No quizzes exist in the database yet. Click "Create New Quiz" above to add one!
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Assessment Title</th>
                    <th>Duration</th>
                    <th>Pass score</th>
                    <th>Scoring (Pos/Neg)</th>
                    <th>Questions</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quizzes.map((quiz) => (
                    <tr key={quiz.id}>
                      <td style={{ fontWeight: 700 }}>{quiz.title}</td>
                      <td>{quiz.duration_minutes} mins</td>
                      <td>{quiz.passing_score}%</td>
                      <td>
                        <span style={{ color: 'var(--success-color)', fontWeight: 600 }}>+{quiz.positive_points}</span>
                        {' / '}
                        <span style={{ color: quiz.negative_points > 0 ? 'var(--danger-color)' : 'var(--text-light)', fontWeight: 600 }}>
                          {quiz.negative_points > 0 ? `-${quiz.negative_points}` : '0'}
                        </span>
                      </td>
                      <td>
                        <button 
                          onClick={() => handleManageQuestions(quiz.id, quiz.title)} 
                          className="btn btn-secondary" 
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', display: 'inline-flex', gap: '0.3rem' }}
                        >
                          <HelpCircle size={14} />
                          <span>{quiz.question_count || 0} Questions</span>
                        </button>
                      </td>
                      <td>
                        <span className={`badge-status ${quiz.is_active ? 'pass' : 'fail'}`}>
                          {quiz.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => handleOpenQuizModal(quiz)} 
                            className="btn btn-secondary btn-icon-only"
                            title="Edit Quiz details"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteQuiz(quiz.id)} 
                            className="btn btn-secondary btn-icon-only"
                            style={{ color: 'var(--danger-color)' }}
                            title="Delete Quiz"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* ================= QUESTIONS MANAGEMENT SCREEN ================= */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
          
          {/* Left Panel: Questions list */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div className="panel-header">
              <h3 style={{ fontSize: '1.25rem' }}>Active Question Pool ({questions.length})</h3>
              <button onClick={() => handleOpenQuestionModal()} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                <Plus size={16} />
                Add Single Question
              </button>
            </div>

            {questions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-light)', fontStyle: 'italic' }}>
                No questions exist inside this quiz yet. Add a question or upload via CSV!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {questions.map((q, idx) => (
                  <div key={q.id} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem', background: 'var(--bg-input)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, lineHeight: '1.3' }}>
                        {idx + 1}. {q.question_text}
                      </h4>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button onClick={() => handleOpenQuestionModal(q)} className="btn btn-secondary btn-icon-only" style={{ padding: '0.35rem' }}>
                          <Edit2 size={12} />
                        </button>
                        <button onClick={() => handleDeleteQuestion(q.id)} className="btn btn-secondary btn-icon-only" style={{ padding: '0.35rem', color: 'var(--danger-color)' }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Option listings */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
                      <div style={{ padding: '0.4rem 0.8rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: q.correct_option === 'A' ? '1px solid var(--success-color)' : '1px solid var(--border-color)' }}>
                        <strong>A:</strong> {q.option_a}
                      </div>
                      <div style={{ padding: '0.4rem 0.8rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: q.correct_option === 'B' ? '1px solid var(--success-color)' : '1px solid var(--border-color)' }}>
                        <strong>B:</strong> {q.option_b}
                      </div>
                      <div style={{ padding: '0.4rem 0.8rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: q.correct_option === 'C' ? '1px solid var(--success-color)' : '1px solid var(--border-color)' }}>
                        <strong>C:</strong> {q.option_c}
                      </div>
                      <div style={{ padding: '0.4rem 0.8rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: q.correct_option === 'D' ? '1px solid var(--success-color)' : '1px solid var(--border-color)' }}>
                        <strong>D:</strong> {q.option_d}
                      </div>
                    </div>

                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <span>Correct Answer: <strong style={{ color: 'var(--success-color)' }}>Option {q.correct_option}</strong></span>
                      {q.explanation && <span>Has explanation reference</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Panel: Bulk upload dropzone */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <FileSpreadsheet size={18} style={{ color: 'var(--secondary-color)' }} />
              CSV Bulk Importer
            </h3>
            
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Bulk upload questions quickly using a standard comma-separated values CSV format.
            </p>

            <div style={{ border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem 1rem', textAlign: 'center', background: 'var(--bg-input)', marginBottom: '1.5rem' }}>
              <Upload size={32} style={{ color: 'var(--text-light)', marginBottom: '0.75rem' }} />
              <input 
                type="file" 
                accept=".csv"
                id="csvFileInput"
                onChange={(e) => setCsvFile(e.target.files[0])}
                style={{ display: 'none' }}
              />
              <label htmlFor="csvFileInput" style={{ display: 'block', cursor: 'pointer', fontWeight: 700, color: 'var(--primary-color)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                {csvFile ? csvFile.name : 'Select CSV File'}
              </label>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Maximum size: 4MB</span>
            </div>

            {uploadMessage && (
              <div className="alert alert-success" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}>
                <Check size={14} />
                <span>{uploadMessage}</span>
              </div>
            )}

            {uploadError && (
              <div className="alert alert-danger" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}>
                <AlertCircle size={14} />
                <span>{uploadError}</span>
              </div>
            )}

            <button 
              onClick={handleCsvUpload} 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '0.65rem' }}
              disabled={uploading || !csvFile}
            >
              {uploading ? 'Processing CSV...' : 'Import Questions'}
            </button>

            <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '1.5rem', paddingTop: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <strong>Expected CSV Headers:</strong>
              <div style={{ background: 'var(--bg-card)', padding: '0.4rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', overflowX: 'auto', marginTop: '0.4rem', whiteSpace: 'nowrap' }}>
                question_text,option_a,option_b,option_c,option_d,correct_option,explanation
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 1: CREATE/EDIT QUIZ ================= */}
      {showQuizModal && (
        <div className="modal-backdrop anim-fade-in" onClick={() => setShowQuizModal(false)}>
          <div className="modal-content glass-panel anim-zoom-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingQuiz ? 'Update Quiz Details' : 'Create Custom Quiz'}</h3>
              <button onClick={() => setShowQuizModal(false)} className="btn-icon-only">X</button>
            </div>
            
            <form onSubmit={handleSaveQuiz}>
              <div className="form-group">
                <label className="form-label">Quiz Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={quizForm.title}
                  onChange={(e) => setQuizForm({...quizForm, title: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-input" 
                  value={quizForm.description}
                  onChange={(e) => setQuizForm({...quizForm, description: e.target.value})}
                  rows="3"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Duration (Minutes)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={quizForm.duration_minutes}
                    onChange={(e) => setQuizForm({...quizForm, duration_minutes: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Passing Score (%)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={quizForm.passing_score}
                    onChange={(e) => setQuizForm({...quizForm, passing_score: parseInt(e.target.value)})}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Reward Points (Correct)</label>
                  <input 
                    type="number" 
                    step="0.5"
                    className="form-input" 
                    value={quizForm.positive_points}
                    onChange={(e) => setQuizForm({...quizForm, positive_points: parseFloat(e.target.value)})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Penalty Points (Wrong)</label>
                  <input 
                    type="number" 
                    step="0.5"
                    className="form-input" 
                    value={quizForm.negative_points}
                    onChange={(e) => setQuizForm({...quizForm, negative_points: parseFloat(e.target.value)})}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                <input 
                  type="checkbox" 
                  id="quizIsActive"
                  checked={quizForm.is_active}
                  onChange={(e) => setQuizForm({...quizForm, is_active: e.target.checked})}
                />
                <label htmlFor="quizIsActive" style={{ fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
                  Enable quiz and publish to curriculum listing directory
                </label>
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowQuizModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Settings</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: CREATE/EDIT QUESTION ================= */}
      {showQuestionModal && (
        <div className="modal-backdrop anim-fade-in" onClick={() => setShowQuestionModal(false)}>
          <div className="modal-content glass-panel anim-zoom-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            <div className="modal-header">
              <h3>{editingQuestion ? 'Update Exam Question' : 'Add Single MCQ Question'}</h3>
              <button onClick={() => setShowQuestionModal(false)} className="btn-icon-only">X</button>
            </div>
            
            <form onSubmit={handleSaveQuestion}>
              <div className="form-group">
                <label className="form-label">Question Text</label>
                <textarea 
                  className="form-input" 
                  value={questionForm.question_text}
                  onChange={(e) => setQuestionForm({...questionForm, question_text: e.target.value})}
                  rows="3"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Option A</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={questionForm.option_a}
                    onChange={(e) => setQuestionForm({...questionForm, option_a: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Option B</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={questionForm.option_b}
                    onChange={(e) => setQuestionForm({...questionForm, option_b: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Option C</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={questionForm.option_c}
                    onChange={(e) => setQuestionForm({...questionForm, option_c: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Option D</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={questionForm.option_d}
                    onChange={(e) => setQuestionForm({...questionForm, option_d: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '1.5rem', marginTop: '0.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Correct Option</label>
                  <select 
                    value={questionForm.correct_option}
                    onChange={(e) => setQuestionForm({...questionForm, correct_option: e.target.value})}
                    className="form-input"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Answer Explanation (Pedagogy Reference)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Provide explanatory context for candidates reviewing results..."
                    value={questionForm.explanation}
                    onChange={(e) => setQuestionForm({...questionForm, explanation: e.target.value})}
                  />
                </div>
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowQuestionModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Question</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
