const mongoose = require('mongoose');

const personalChemicalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'userModel'
  },
  userModel: {
    type: String,
    required: true,
    enum: ['User', 'Guest']
  },
  chemicalId: { 
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  formula: {
    type: String
  },
  iupac: {
    type: String
  },
  quantity: {
    type: String,
    default: '0'
  }
}, {
  timestamps: true
});

personalChemicalSchema.index({ userId: 1, chemicalId: 1 }, { unique: true });

module.exports = mongoose.model('PersonalChemical', personalChemicalSchema);
