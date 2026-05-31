const db = require('../config/db');

// @desc    Get admin analytics overview (Users, attempts, distributions)
// @route   GET /api/analytics/admin
// @access  Private/Admin
async function getAdminAnalytics(req, res) {
  try {
    // 1. Core counters
    const [usersCount] = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'user'");
    const [quizzesCount] = await db.query("SELECT COUNT(*) as count FROM quizzes");
    const [attemptsCount] = await db.query("SELECT COUNT(*) as count FROM quiz_attempts WHERE is_submitted = TRUE");
    
    // 2. Scores stats
    const [scoreStats] = await db.query("SELECT AVG(score) as avg_score, MAX(score) as max_score, MIN(score) as min_score FROM results");
    
    // 3. Quiz-by-quiz participation breakdown
    const [quizBreakdown] = await db.query(`
      SELECT 
        q.id, 
        q.title, 
        COUNT(r.id) as total_attempts, 
        AVG(r.score) as average_score, 
        SUM(CASE WHEN r.passed = TRUE THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(r.id), 0) as pass_rate
      FROM quizzes q
      LEFT JOIN results r ON q.id = r.quiz_id
      GROUP BY q.id
    `);
    
    // 4. Recent activity log
    const [recentAttempts] = await db.query(`
      SELECT 
        qa.id, 
        u.username, 
        q.title as quiz_title, 
        r.score, 
        r.passed, 
        qa.end_time 
      FROM quiz_attempts qa
      JOIN users u ON qa.user_id = u.id
      JOIN quizzes q ON qa.quiz_id = q.id
      JOIN results r ON qa.id = r.attempt_id
      WHERE qa.is_submitted = TRUE
      ORDER BY qa.end_time DESC
      LIMIT 10
    `);
    
    return res.json({
      success: true,
      stats: {
        totalUsers: usersCount[0].count,
        totalQuizzes: quizzesCount[0].count,
        totalAttempts: attemptsCount[0].count,
        avgScore: parseFloat(scoreStats[0].avg_score || '0').toFixed(2),
        highestScore: parseFloat(scoreStats[0].max_score || '0').toFixed(2),
        lowestScore: parseFloat(scoreStats[0].min_score || '0').toFixed(2)
      },
      quizBreakdown: quizBreakdown.map(q => ({
        ...q,
        average_score: parseFloat(q.average_score || '0').toFixed(2),
        pass_rate: parseFloat(q.pass_rate || '0').toFixed(1)
      })),
      recentActivity: recentAttempts
    });
  } catch (error) {
    console.error('Fetch admin analytics error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error generating admin analytics' });
  }
}

// @desc    Get individual user performance analytics
// @route   GET /api/analytics/user
// @access  Private
async function getUserAnalytics(req, res) {
  const userId = req.user.id;
  
  try {
    // 1. Overall stats
    const [attempts] = await db.query('SELECT COUNT(*) as count FROM quiz_attempts WHERE user_id = ? AND is_submitted = TRUE', [userId]);
    const [passed] = await db.query('SELECT COUNT(*) as count FROM results WHERE user_id = ? AND passed = TRUE', [userId]);
    const [highestScore] = await db.query('SELECT MAX(score) as score FROM results WHERE user_id = ?', [userId]);
    
    const totalAttempts = attempts[0].count;
    const totalPassed = passed[0].count;
    const passRate = totalAttempts > 0 ? ((totalPassed / totalAttempts) * 100).toFixed(1) : '0.0';
    
    // 2. Timeline of scores (for charts)
    const [timeline] = await db.query(`
      SELECT 
        q.title as label, 
        r.score, 
        qa.end_time 
      FROM results r
      JOIN quiz_attempts qa ON r.attempt_id = qa.id
      JOIN quizzes q ON r.quiz_id = q.id
      WHERE r.user_id = ?
      ORDER BY qa.end_time ASC
      LIMIT 15
    `, [userId]);
    
    // 3. Quiz-specific progress
    const [progress] = await db.query(`
      SELECT 
        q.id as quiz_id,
        q.title as quiz_title,
        q.passing_score,
        COUNT(r.id) as attempts_count,
        MAX(r.score) as highest_score,
        MAX(r.passed) as has_passed
      FROM quizzes q
      LEFT JOIN results r ON q.id = r.quiz_id AND r.user_id = ?
      WHERE q.is_active = TRUE
      GROUP BY q.id
    `, [userId]);
    
    return res.json({
      success: true,
      summary: {
        totalAttempts,
        totalPassed,
        passRate,
        highestScore: parseFloat(highestScore[0].score || '0').toFixed(2)
      },
      timeline,
      quizProgress: progress.map(p => ({
        ...p,
        highest_score: p.highest_score !== null ? parseFloat(p.highest_score).toFixed(2) : null,
        has_passed: !!p.has_passed
      }))
    });
  } catch (error) {
    console.error('Fetch user analytics error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error generating user analytics' });
  }
}

module.exports = {
  getAdminAnalytics,
  getUserAnalytics
};
