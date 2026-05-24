const express = require('express');
const { chatWithPdf } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, chatWithPdf);

module.exports = router;
