// models/Log.js
const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Index for efficient querying by user
logSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Log', logSchema);