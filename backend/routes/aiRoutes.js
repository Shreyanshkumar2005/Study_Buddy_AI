const express = require('express');
const router = express.Router();
const {
  generateSummary,
  generatePracticeQuestions,
  getAIHistory
} = require('../controllers/aiController');
const { verifyToken } = require('../middleware/authMiddleware');
const { aiRateLimiter } = require('../middleware/rateLimiter');

// Chained Middleware: verifyToken -> custom aiRateLimiter -> controller
router.post('/summary/:noteId', verifyToken, aiRateLimiter, generateSummary);
router.post('/questions/:noteId', verifyToken, aiRateLimiter, generatePracticeQuestions);
router.get('/history', verifyToken, getAIHistory);

module.exports = router;
