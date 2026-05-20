const Document = require('../models/Document');

// @desc    Upload a PDF document
// @route   POST /api/documents/upload
// @access  Private
const uploadDocument = async (req, res) => {
  try {
    // req.file contains the file info from Cloudinary
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const document = await Document.create({
      user: req.user._id, // Gotten from our Auth Middleware
      title: req.file.originalname,
      fileUrl: req.file.path, // The secure Cloudinary URL
      cloudinaryId: req.file.filename,
    });

    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadDocument };
