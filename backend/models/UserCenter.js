const mongoose = require('mongoose');

const userCenterSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  centerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Center',
    required: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
});

userCenterSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model('UserCenter', userCenterSchema);
