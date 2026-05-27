const express = require('express');
const { uploadDocument,getUserDocuments} = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

const router = express.Router();
router.get('/', protect, getUserDocuments);
// The route looks like this:
// 1. Check if user is logged in (protect)
// 2. Upload the file to Cloudinary (upload.single)
// 3. Save to database (uploadDocument)
router.post('/upload', protect, upload.single('file'), uploadDocument);

module.exports = router;
