const mongoose = require('mongoose');

const savedPaperSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  authors: [String],
  url: { type: String, required: true },
  abstract: String,
  year: Number
}, { timestamps: true });

module.exports = mongoose.model('SavedPaper', savedPaperSchema);
