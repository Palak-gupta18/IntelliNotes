const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const dotenv = require('dotenv');

dotenv.config();

// Connect to your Cloudinary account
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure where the files should go
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'AI_Study_Assistant_PDFs', 
    resource_type: 'raw',
    allowed_formats: ['pdf'], // We only want PDFs for now
  },
});

const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };
