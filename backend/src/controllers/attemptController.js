const db = require('../config/db');

// Safe cross-database parser for date fields (works with SQLite string or MySQL Date object)
function parseDbDate(dbDate) {
  if (!dbDate) return new Date();
  if (dbDate instanceof Date) {
    return dbDate;
  }
  if (typeof dbDate === 'string') {
    // If it's a simple 'YYYY-MM-DD HH:mm:ss' format from SQLite, parse as UTC ISO string
    if (!dbDate.includes('T') && !dbDate.includes('Z')) {
      return new Date(dbDate.replace(' ', 'T') + 'Z');
    }
    return new Date(dbDate);
  }
  return new Date(dbDate);
}

// @desc    Start a new quiz attempt
// @route   POST /api/attempts/start
// @access  Private
async function startAttempt(req, res) {
  const { quizId } = req.body;
  const userId = req.user.id;
  
  if (!quizId) {
    return res.status(400).json({ success: false, message: 'Quiz ID is required' });
  }
  
  try {
    // 1. Fetch quiz info to verify active and calculate end time
    const [quizzes] = await db.query('SELECT * FROM quizzes WHERE id = ? AND is_active = TRUE', [quizId]);
    if (!quizzes || quizzes.length === 0) {
      return res.status(404).json({ success: false, message: 'Quiz not found or inactive' });
    }
    
    const quiz = quizzes[0];
    
    // 2. Prevent initiating duplicate active attempts (auto-submit previous unsubmitted attempts)
    const [activeAttempts] = await db.query(
      'SELECT id, end_time FROM quiz_attempts WHERE user_id = ? AND quiz_id = ? AND is_submitted = FALSE',
      [userId, quizId]
    );
    
    if (activeAttempts && activeAttempts.length > 0) {
      const active = activeAttempts[0];
      const timeRemaining = parseDbDate(active.end_time) - new Date();
      
      // If there is an ongoing valid attempt, return it!
      if (timeRemaining > 0) {
        return res.json({
          success: true,
          message: 'Active attempt resumed',
          attemptId: active.id,
          endTime: active.end_time,
          timeRemainingSeconds: Math.ceil(timeRemaining / 1000)
        });
      } else {
        // If expired, auto-submit it before creating a new one
        await autoSubmitAttemptInternal(active.id, userId, quizId);
      }
    }
    
    // 3. Compute attempt end time
    const durationMs = quiz.duration_minutes * 60 * 1000;
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + durationMs);
    
    // Store in proper datetime format for database (MySQL/SQLite compatible)
    const startTimeStr = startTime.toISOString().replace('T', ' ').substring(0, 19);
    const endTimeStr = endTime.toISOString().replace('T', ' ').substring(0, 19);
    
    // 4. Create attempt
    const [result] = await db.query(
      'INSERT INTO quiz_attempts (user_id, quiz_id, start_time, end_time, is_submitted) VALUES (?, ?, ?, ?, FALSE)',
      [userId, quizId, startTimeStr, endTimeStr]
    );
    
    const attemptId = result.insertId;
    
    return res.status(201).json({
      success: true,
      message: 'Quiz attempt started successfully',
      attemptId,
      endTime: endTimeStr,
      timeRemainingSeconds: quiz.duration_minutes * 60
    });
  } catch (error) {
    console.error('Start attempt error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error starting attempt' });
  }
}

// @desc    Real-time saving of single question selection (Auto-save)
// @route   POST /api/attempts/save-answer
// @access  Private
async function saveAnswer(req, res) {
  const { attemptId, questionId, selectedOption } = req.body;
  const userId = req.user.id;
  
  if (!attemptId || !questionId) {
    return res.status(400).json({ success: false, message: 'Attempt ID and Question ID are required' });
  }
  
  try {
    // 1. Verify attempt ownership and active status (not submitted and not timed out)
    const [attempts] = await db.query('SELECT * FROM quiz_attempts WHERE id = ? AND user_id = ?', [attemptId, userId]);
    if (!attempts || attempts.length === 0) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }
    
    const attempt = attempts[0];
    if (attempt.is_submitted) {
      return res.status(400).json({ success: false, message: 'This attempt is already submitted' });
    }
    
    const timeRemaining = parseDbDate(attempt.end_time) - new Date();
    if (timeRemaining <= -10000) { // Allow 10s grace period for lag
      // Auto submit expired attempt
      await autoSubmitAttemptInternal(attemptId, userId, attempt.quiz_id);
      return res.status(400).json({ success: false, message: 'Time limit has expired' });
    }
    
    // 2. Fetch the correct option for this question to pre-calculate correctness
    const [questions] = await db.query('SELECT correct_option FROM questions WHERE id = ?', [questionId]);
    if (!questions || questions.length === 0) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    
    const isCorrect = selectedOption && selectedOption.toUpperCase() === questions[0].correct_option.toUpperCase();
    
    // 3. Upsert answer: select first to see if we update or insert (cross-compatible)
    const [existingAnswer] = await db.query('SELECT id FROM answers WHERE attempt_id = ? AND question_id = ?', [attemptId, questionId]);
    
    if (existingAnswer && existingAnswer.length > 0) {
      await db.query(
        'UPDATE answers SET selected_option = ?, is_correct = ? WHERE attempt_id = ? AND question_id = ?',
        [selectedOption, isCorrect ? 1 : 0, attemptId, questionId]
      );
    } else {
      await db.query(
        'INSERT INTO answers (attempt_id, question_id, selected_option, is_correct) VALUES (?, ?, ?, ?)',
        [attemptId, questionId, selectedOption, isCorrect ? 1 : 0]
      );
    }
    
    return res.json({ success: true, message: 'Answer saved' });
  } catch (error) {
    console.error('Save answer error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error saving answer' });
  }
}

// @desc    Submit quiz attempt and calculate results
// @route   POST /api/attempts/:id/submit
// @access  Private
async function submitAttempt(req, res) {
  const attemptId = req.params.id;
  const userId = req.user.id;
  
  try {
    const [attempts] = await db.query('SELECT * FROM quiz_attempts WHERE id = ? AND user_id = ?', [attemptId, userId]);
    if (!attempts || attempts.length === 0) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }
    
    const attempt = attempts[0];
    if (attempt.is_submitted) {
      // If already submitted, return the compiled result directly
      const [existingResults] = await db.query('SELECT * FROM results WHERE attempt_id = ?', [attemptId]);
      if (existingResults && existingResults.length > 0) {
        return res.json({ success: true, message: 'Attempt was already submitted', result: existingResults[0] });
      }
    }
    
    const result = await autoSubmitAttemptInternal(attemptId, userId, attempt.quiz_id);
    return res.json({ success: true, message: 'Quiz submitted successfully', result });
  } catch (error) {
    console.error('Submit attempt error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error submitting attempt' });
  }
}

// Internal reusable scoring engine
async function autoSubmitAttemptInternal(attemptId, userId, quizId) {
  // 1. Fetch quiz scoring rules
  const [quizzes] = await db.query('SELECT * FROM quizzes WHERE id = ?', [quizId]);
  const quiz = quizzes[0];
  
  // 2. Fetch all questions for this quiz
  const [questions] = await db.query('SELECT id, correct_option FROM questions WHERE quiz_id = ?', [quizId]);
  const totalQuestions = questions.length;
  
  // 3. Fetch user saved answers
  const [answers] = await db.query('SELECT question_id, selected_option, is_correct FROM answers WHERE attempt_id = ?', [attemptId]);
  const answerMap = new Map(answers.map(ans => [ans.question_id, ans]));
  
  let correctAnswers = 0;
  let incorrectAnswers = 0;
  let finalScore = 0;
  
  // 4. Calculate score with negative marking
  for (const question of questions) {
    const userAnswer = answerMap.get(question.id);
    if (!userAnswer || !userAnswer.selected_option) {
      // Unanswered question has zero impact
      continue;
    }
    
    if (userAnswer.selected_option.toUpperCase() === question.correct_option.toUpperCase()) {
      correctAnswers++;
      finalScore += quiz.positive_points;
    } else {
      incorrectAnswers++;
      finalScore -= quiz.negative_points; // Subtract negative marking configuration
    }
  }
  
  // Avoid negative totals
  if (finalScore < 0) {
    finalScore = 0;
  }
  
  // 5. Calculate passing status (based on percentage score)
  const maxPossibleScore = totalQuestions * quiz.positive_points;
  const scorePercentage = maxPossibleScore > 0 ? (finalScore / maxPossibleScore) * 100 : 0;
  const passed = scorePercentage >= quiz.passing_score;
  
  // 6. Update quiz attempt state
  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
  await db.query('UPDATE quiz_attempts SET is_submitted = TRUE, end_time = ? WHERE id = ?', [nowStr, attemptId]);
  
  // 7. Save in results
  await db.query(
    'INSERT INTO results (attempt_id, user_id, quiz_id, total_questions, correct_answers, incorrect_answers, score, passed) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [attemptId, userId, quizId, totalQuestions, correctAnswers, incorrectAnswers, finalScore, passed ? 1 : 0]
  );
  
  // Retrieve the generated result
  const [newResults] = await db.query('SELECT * FROM results WHERE attempt_id = ?', [attemptId]);
  const finalResult = newResults[0];
  
  // 8. Update Leaderboard ranking (upsert)
  const [existingRank] = await db.query('SELECT * FROM leaderboard WHERE user_id = ? AND quiz_id = ?', [userId, quizId]);
  if (existingRank && existingRank.length > 0) {
    const higherScore = Math.max(existingRank[0].highest_score, finalScore);
    const newTotalAttempts = existingRank[0].total_attempts + 1;
    await db.query(
      'UPDATE leaderboard SET highest_score = ?, total_attempts = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND quiz_id = ?',
      [higherScore, newTotalAttempts, userId, quizId]
    );
  } else {
    await db.query(
      'INSERT INTO leaderboard (user_id, quiz_id, highest_score, total_attempts) VALUES (?, ?, ?, 1)',
      [userId, quizId, finalScore]
    );
  }
  
  return finalResult;
}

// @desc    Get user attempt history
// @route   GET /api/attempts/history
// @access  Private
async function getHistory(req, res) {
  const userId = req.user.id;
  try {
    const [history] = await db.query(
      'SELECT r.*, q.title as quiz_title, qa.start_time, qa.end_time FROM results r JOIN quizzes q ON r.quiz_id = q.id JOIN quiz_attempts qa ON r.attempt_id = qa.id WHERE r.user_id = ? ORDER BY r.created_at DESC',
      [userId]
    );
    return res.json({ success: true, history });
  } catch (error) {
    console.error('Fetch history error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error fetching attempt history' });
  }
}

// @desc    Get detailed review breakdown of a completed attempt (includes correct options & explanations)
// @route   GET /api/attempts/:id/review
// @access  Private
async function getAttemptReview(req, res) {
  const attemptId = req.params.id;
  const userId = req.user.id;
  
  try {
    // 1. Verify ownership
    const [attempts] = await db.query(
      'SELECT qa.*, q.title as quiz_title FROM quiz_attempts qa JOIN quizzes q ON qa.quiz_id = q.id WHERE qa.id = ? AND qa.user_id = ? AND qa.is_submitted = TRUE',
      [attemptId, userId]
    );
    
    if (!attempts || attempts.length === 0) {
      return res.status(404).json({ success: false, message: 'Submitted attempt not found' });
    }
    
    const attempt = attempts[0];
    
    // 2. Fetch results
    const [results] = await db.query('SELECT * FROM results WHERE attempt_id = ?', [attemptId]);
    
    // 3. Fetch questions, their answers, and user selections
    const [questions] = await db.query(
      'SELECT q.id, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option, q.explanation, ans.selected_option, ans.is_correct FROM questions q LEFT JOIN answers ans ON q.id = ans.question_id AND ans.attempt_id = ? WHERE q.quiz_id = ? ORDER BY q.id ASC',
      [attemptId, attempt.quiz_id]
    );
    
    return res.json({
      success: true,
      attempt,
      result: results[0],
      review: questions
    });
  } catch (error) {
    console.error('Fetch review error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error fetching attempt review' });
  }
}

module.exports = {
  startAttempt,
  saveAnswer,
  submitAttempt,
  getHistory,
  getAttemptReview
};
