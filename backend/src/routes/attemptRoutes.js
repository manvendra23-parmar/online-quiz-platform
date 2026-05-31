const express = require('express');
const router = express.Router();
const attemptController = require('../controllers/attemptController');
const { protect } = require('../middleware/authMiddleware');

router.post('/start', protect, attemptController.startAttempt);
router.post('/save-answer', protect, attemptController.saveAnswer);
router.post('/:id/submit', protect, attemptController.submitAttempt);
router.get('/history', protect, attemptController.getHistory);
router.get('/:id/review', protect, attemptController.getAttemptReview);

module.exports = router;
