const db = require('../config/db');

// @desc    Get leaderboard rankings for a specific quiz
// @route   GET /api/leaderboard/:quizId
// @access  Private
async function getLeaderboardByQuiz(req, res) {
  const quizId = req.params.quizId;
  
  try {
    // Verify quiz exists
    const [quizzes] = await db.query('SELECT title FROM quizzes WHERE id = ?', [quizId]);
    if (!quizzes || quizzes.length === 0) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    
    // Fetch rankings sorted by highest score descending
    const [rankings] = await db.query(
      'SELECT l.user_id, l.highest_score, l.total_attempts, u.username, u.avatar, l.updated_at FROM leaderboard l JOIN users u ON l.user_id = u.id WHERE l.quiz_id = ? ORDER BY l.highest_score DESC, l.total_attempts ASC',
      [quizId]
    );
    
    // Dynamically assign ranks in JavaScript for bulletproof cross-compatibility
    const mappedRankings = rankings.map((userRank, index) => ({
      rank: index + 1,
      ...userRank
    }));
    
    return res.json({
      success: true,
      quizTitle: quizzes[0].title,
      leaderboard: mappedRankings
    });
  } catch (error) {
    console.error('Fetch leaderboard error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error fetching leaderboard' });
  }
}

// @desc    Get overall global leaderboard across all quizzes
// @route   GET /api/leaderboard
// @access  Private
async function getGlobalLeaderboard(req, res) {
  try {
    // Sum of highest scores across all attempted quizzes for each user
    const [globalRankings] = await db.query(
      'SELECT l.user_id, SUM(l.highest_score) as total_score, SUM(l.total_attempts) as total_attempts, u.username, u.avatar FROM leaderboard l JOIN users u ON l.user_id = u.id GROUP BY l.user_id ORDER BY total_score DESC, total_attempts ASC LIMIT 20'
    );
    
    const mappedGlobal = globalRankings.map((userRank, index) => ({
      rank: index + 1,
      total_score: parseFloat(userRank.total_score || '0'),
      ...userRank
    }));
    
    return res.json({
      success: true,
      leaderboard: mappedGlobal
    });
  } catch (error) {
    console.error('Fetch global leaderboard error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error fetching global leaderboard' });
  }
}

module.exports = {
  getLeaderboardByQuiz,
  getGlobalLeaderboard
};
