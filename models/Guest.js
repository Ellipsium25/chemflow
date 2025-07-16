const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema({
  guestId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  // Add any guest-specific fields you need
  preferences: {
    type: Object,
    default: {}
  },
  data: {
    type: Object,
    default: {}
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// TTL index - automatically delete guests after 24 hours of inactivity
guestSchema.index({ lastActive: 1 }, { expireAfterSeconds: 86400 }); // 24 hours

// Update last active timestamp
guestSchema.methods.updateActivity = function() {
  this.lastActive = new Date();
  return this.save();
};

module.exports = mongoose.model('Guest', guestSchema);