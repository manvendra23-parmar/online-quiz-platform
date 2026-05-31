const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const uploadController = require('../controllers/uploadController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads folder exists
const uploadDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer upload setup
const upload = multer({ dest: uploadDir });

// --- Quiz Routes ---
router.get('/', protect, quizController.getAllQuizzes);
router.get('/:id', protect, quizController.getQuizById);
router.post('/', protect, adminOnly, quizController.createQuiz);
router.put('/:id', protect, adminOnly, quizController.updateQuiz);
router.delete('/:id', protect, adminOnly, quizController.deleteQuiz);

// --- Question Routes ---
router.post('/:id/questions', protect, adminOnly, quizController.addQuestion);
router.put('/questions/:questionId', protect, adminOnly, quizController.updateQuestion);
router.delete('/questions/:questionId', protect, adminOnly, quizController.deleteQuestion);

// --- Bulk Upload Route ---
router.post('/:id/bulk-upload', protect, adminOnly, upload.single('file'), uploadController.bulkUploadQuestions);

module.exports = router;
