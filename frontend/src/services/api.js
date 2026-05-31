// Client-side API Service Client

const API_BASE = '/api';

async function callApi(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  // Set headers
  const headers = { ...options.headers };
  
  // If sending normal JSON, set Content-Type
  // If it's a FormData (for CSV file uploads), let fetch set the boundary header automatically!
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers
  };
  
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'An API error occurred'
      };
    }
    
    return data;
  } catch (error) {
    console.error('Fetch error:', error.message);
    return {
      success: false,
      message: 'Network error connecting to the server. Ensure the backend is running.'
    };
  }
}

export const api = {
  // Authentication
  login: (credentials) => callApi('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => callApi('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => callApi('/auth/me'),
  updateProfile: (profileData) => callApi('/auth/profile', { method: 'PUT', body: JSON.stringify(profileData) }),
  
  // Quizzes CRUD
  getQuizzes: (search = '', activeOnly = false) => callApi(`/quizzes?search=${encodeURIComponent(search)}&activeOnly=${activeOnly}`),
  getQuizDetails: (quizId) => callApi(`/quizzes/${quizId}`),
  createQuiz: (quizData) => callApi('/quizzes', { method: 'POST', body: JSON.stringify(quizData) }),
  updateQuiz: (quizId, quizData) => callApi(`/quizzes/${quizId}`, { method: 'PUT', body: JSON.stringify(quizData) }),
  deleteQuiz: (quizId) => callApi(`/quizzes/${quizId}`, { method: 'DELETE' }),
  
  // Questions CRUD
  addQuestion: (quizId, questionData) => callApi(`/quizzes/${quizId}/questions`, { method: 'POST', body: JSON.stringify(questionData) }),
  updateQuestion: (questionId, questionData) => callApi(`/quizzes/questions/${questionId}`, { method: 'PUT', body: JSON.stringify(questionData) }),
  deleteQuestion: (questionId) => callApi(`/quizzes/questions/${questionId}`, { method: 'DELETE' }),
  
  // CSV Question Bulk Upload
  bulkUploadQuestions: (quizId, formData) => callApi(`/quizzes/${quizId}/bulk-upload`, { method: 'POST', body: formData }),
  
  // Quiz Take / Attempts
  startAttempt: (quizId) => callApi('/attempts/start', { method: 'POST', body: JSON.stringify({ quizId }) }),
  saveAnswer: (attemptId, questionId, selectedOption) => callApi('/attempts/save-answer', { method: 'POST', body: JSON.stringify({ attemptId, questionId, selectedOption }) }),
  submitAttempt: (attemptId) => callApi(`/attempts/${attemptId}/submit`, { method: 'POST' }),
  getHistory: () => callApi('/attempts/history'),
  getAttemptReview: (attemptId) => callApi(`/attempts/${attemptId}/review`),
  
  // Rankings / Leaderboards
  getGlobalLeaderboard: () => callApi('/leaderboard'),
  getQuizLeaderboard: (quizId) => callApi(`/leaderboard/${quizId}`),
  
  // Analytics
  getAdminAnalytics: () => callApi('/analytics/admin'),
  getUserAnalytics: () => callApi('/analytics/user')
};
