const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // This links the document to the User who uploaded it
    },
    title: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String, // The Cloudinary URL
      required: true,
    },
    cloudinaryId: {
      type: String,
      required: true,
    },
    extractedText: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },

  },
  {
    timestamps: true,
  }
);

const Document = mongoose.model('Document', documentSchema);
module.exports = Document;
