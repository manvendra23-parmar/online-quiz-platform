const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, leaderboardController.getGlobalLeaderboard);
router.get('/:quizId', protect, leaderboardController.getLeaderboardByQuiz);

module.exports = router;
