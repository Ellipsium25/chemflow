const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  originalName: { type: String, required: true }, // user-facing name
  storedName: { type: String, required: true },   // actual filename on disk
  mimeType: { type: String, required: true },
  size: { type: Number },                         // optional, for display
  path: { type: String, required: true },
}, {
  timestamps: true // gives createdAt and updatedAt
});

module.exports = mongoose.model('File', fileSchema);
