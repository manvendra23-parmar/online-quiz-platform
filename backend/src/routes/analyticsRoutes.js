const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/admin', protect, adminOnly, analyticsController.getAdminAnalytics);
router.get('/user', protect, analyticsController.getUserAnalytics);

module.exports = router;
