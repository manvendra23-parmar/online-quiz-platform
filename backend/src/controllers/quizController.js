const db = require('../config/db');

// @desc    Get all quizzes (Search/Filter supported)
// @route   GET /api/quizzes
// @access  Private (All authenticated users)
async function getAllQuizzes(req, res) {
  const { search, activeOnly } = req.query;
  const isAdmin = req.user.role === 'admin';
  
  let sql = 'SELECT q.*, u.username as creator_name, COUNT(qs.id) as question_count FROM quizzes q LEFT JOIN users u ON q.created_by = u.id LEFT JOIN questions qs ON q.id = qs.quiz_id';
  let queryParams = [];
  let conditions = [];
  
  // If not admin, or activeOnly is explicitly requested
  if (!isAdmin || activeOnly === 'true') {
    conditions.push('q.is_active = TRUE');
  }
  
  if (search) {
    conditions.push('(q.title LIKE ? OR q.description LIKE ?)');
    queryParams.push(`%${search}%`, `%${search}%`);
  }
  
  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }
  
  sql += ' GROUP BY q.id ORDER BY q.created_at DESC';
  
  try {
    const [quizzes] = await db.query(sql, queryParams);
    return res.json({ success: true, quizzes });
  } catch (error) {
    console.error('Fetch quizzes error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error fetching quizzes' });
  }
}

// @desc    Get single quiz details (Filters correct options for standard users)
// @route   GET /api/quizzes/:id
// @access  Private (All authenticated users)
async function getQuizById(req, res) {
  const quizId = req.params.id;
  const isAdmin = req.user.role === 'admin';
  
  try {
    // 1. Fetch quiz info
    const [quizzes] = await db.query(
      'SELECT q.*, u.username as creator_name FROM quizzes q LEFT JOIN users u ON q.created_by = u.id WHERE q.id = ?',
      [quizId]
    );
    
    if (!quizzes || quizzes.length === 0) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    
    const quiz = quizzes[0];
    
    // 2. Fetch questions
    // If Admin: select EVERYTHING including correct option and explanation.
    // If standard user: select options but OMIT correct_option and explanation for anti-cheat security!
    let questionsSql = '';
    if (isAdmin) {
      questionsSql = 'SELECT * FROM questions WHERE quiz_id = ? ORDER BY id ASC';
    } else {
      questionsSql = 'SELECT id, quiz_id, question_text, option_a, option_b, option_c, option_d FROM questions WHERE quiz_id = ?';
    }
    
    const [questions] = await db.query(questionsSql, [quizId]);
    
    // For standard users, we can randomize question order if requested
    let processedQuestions = questions;
    if (!isAdmin) {
      processedQuestions = questions.sort(() => Math.random() - 0.5);
    }
    
    return res.json({
      success: true,
      quiz,
      questions: processedQuestions
    });
  } catch (error) {
    console.error('Fetch quiz error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error fetching quiz' });
  }
}

// @desc    Create a quiz
// @route   POST /api/quizzes
// @access  Private/Admin
async function createQuiz(req, res) {
  const { title, description, duration_minutes, passing_score, positive_points, negative_points, is_active } = req.body;
  const adminId = req.user.id;
  
  if (!title) {
    return res.status(400).json({ success: false, message: 'Quiz title is required' });
  }
  
  try {
    const active = is_active !== undefined ? is_active : true;
    const duration = duration_minutes || 30;
    const passScore = passing_score || 50;
    const positive = positive_points !== undefined ? parseFloat(positive_points) : 4.0;
    const negative = negative_points !== undefined ? parseFloat(negative_points) : 1.0;
    
    const [result] = await db.query(
      'INSERT INTO quizzes (title, description, duration_minutes, passing_score, positive_points, negative_points, is_active, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description, duration, passScore, positive, negative, active, adminId]
    );
    
    return res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      quizId: result.insertId
    });
  } catch (error) {
    console.error('Create quiz error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error creating quiz' });
  }
}

// @desc    Update a quiz
// @route   PUT /api/quizzes/:id
// @access  Private/Admin
async function updateQuiz(req, res) {
  const quizId = req.params.id;
  const { title, description, duration_minutes, passing_score, positive_points, negative_points, is_active } = req.body;
  
  try {
    // Check existence
    const [existing] = await db.query('SELECT id FROM quizzes WHERE id = ?', [quizId]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    
    let queryParts = [];
    let queryParams = [];
    
    if (title !== undefined) { queryParts.push('title = ?'); queryParams.push(title); }
    if (description !== undefined) { queryParts.push('description = ?'); queryParams.push(description); }
    if (duration_minutes !== undefined) { queryParts.push('duration_minutes = ?'); queryParams.push(duration_minutes); }
    if (passing_score !== undefined) { queryParts.push('passing_score = ?'); queryParams.push(passing_score); }
    if (positive_points !== undefined) { queryParts.push('positive_points = ?'); queryParams.push(parseFloat(positive_points)); }
    if (negative_points !== undefined) { queryParts.push('negative_points = ?'); queryParams.push(parseFloat(negative_points)); }
    if (is_active !== undefined) { queryParts.push('is_active = ?'); queryParams.push(is_active); }
    
    if (queryParts.length === 0) {
      return res.json({ success: true, message: 'No updates requested' });
    }
    
    queryParams.push(quizId);
    await db.query(`UPDATE quizzes SET ${queryParts.join(', ')} WHERE id = ?`, queryParams);
    
    return res.json({ success: true, message: 'Quiz updated successfully' });
  } catch (error) {
    console.error('Update quiz error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error updating quiz' });
  }
}

// @desc    Delete a quiz
// @route   DELETE /api/quizzes/:id
// @access  Private/Admin
async function deleteQuiz(req, res) {
  const quizId = req.params.id;
  
  try {
    const [existing] = await db.query('SELECT id FROM quizzes WHERE id = ?', [quizId]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    
    await db.query('DELETE FROM quizzes WHERE id = ?', [quizId]);
    return res.json({ success: true, message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Delete quiz error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error deleting quiz' });
  }
}

// @desc    Add a question to a quiz
// @route   POST /api/quizzes/:id/questions
// @access  Private/Admin
async function addQuestion(req, res) {
  const quizId = req.params.id;
  const { question_text, option_a, option_b, option_c, option_d, correct_option, explanation } = req.body;
  
  if (!question_text || !option_a || !option_b || !option_c || !option_d || !correct_option) {
    return res.status(400).json({ success: false, message: 'Please provide question text, four options, and the correct option' });
  }
  
  try {
    const [result] = await db.query(
      'INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [quizId, question_text, option_a, option_b, option_c, option_d, correct_option.toUpperCase(), explanation]
    );
    
    return res.status(201).json({
      success: true,
      message: 'Question added successfully',
      questionId: result.insertId
    });
  } catch (error) {
    console.error('Add question error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error adding question' });
  }
}

// @desc    Update a question
// @route   PUT /api/questions/:questionId
// @access  Private/Admin
async function updateQuestion(req, res) {
  const questionId = req.params.questionId;
  const { question_text, option_a, option_b, option_c, option_d, correct_option, explanation } = req.body;
  
  try {
    const [existing] = await db.query('SELECT id FROM questions WHERE id = ?', [questionId]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    
    let queryParts = [];
    let queryParams = [];
    
    if (question_text !== undefined) { queryParts.push('question_text = ?'); queryParams.push(question_text); }
    if (option_a !== undefined) { queryParts.push('option_a = ?'); queryParams.push(option_a); }
    if (option_b !== undefined) { queryParts.push('option_b = ?'); queryParams.push(option_b); }
    if (option_c !== undefined) { queryParts.push('option_c = ?'); queryParams.push(option_c); }
    if (option_d !== undefined) { queryParts.push('option_d = ?'); queryParams.push(option_d); }
    if (correct_option !== undefined) { queryParts.push('correct_option = ?'); queryParams.push(correct_option.toUpperCase()); }
    if (explanation !== undefined) { queryParts.push('explanation = ?'); queryParams.push(explanation); }
    
    if (queryParts.length === 0) {
      return res.json({ success: true, message: 'No updates requested' });
    }
    
    queryParams.push(questionId);
    await db.query(`UPDATE questions SET ${queryParts.join(', ')} WHERE id = ?`, queryParams);
    
    return res.json({ success: true, message: 'Question updated successfully' });
  } catch (error) {
    console.error('Update question error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error updating question' });
  }
}

// @desc    Delete a question
// @route   DELETE /api/questions/:questionId
// @access  Private/Admin
async function deleteQuestion(req, res) {
  const questionId = req.params.questionId;
  
  try {
    const [existing] = await db.query('SELECT id FROM questions WHERE id = ?', [questionId]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    
    await db.query('DELETE FROM questions WHERE id = ?', [questionId]);
    return res.json({ success: true, message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Delete question error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error deleting question' });
  }
}

module.exports = {
  getAllQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  addQuestion,
  updateQuestion,
  deleteQuestion
};
