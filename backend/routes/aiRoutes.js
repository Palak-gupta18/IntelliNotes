const express = require('express');
const { generateSummary, generateQuiz, generateFlashcards } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/summary', protect, generateSummary);
router.post('/quiz', protect, generateQuiz);
router.post('/flashcards', protect, generateFlashcards);

module.exports = router;
