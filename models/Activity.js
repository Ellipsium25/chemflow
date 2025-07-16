const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  source: {
    type: String,
    enum: ['lablogs', 'personalDB', 'research'],
    required: true
  },
  type: {
    type: String,
    enum: ['created', 'updated', 'saved'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  link: {
    type: String,
    required: true
  }
}, {
  timestamps: true // adds createdAt (used as timestamp)
});

module.exports = mongoose.model('Activity', activitySchema);