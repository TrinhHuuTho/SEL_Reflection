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
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Chống trùng lặp: Đảm bảo 1 User chỉ tham gia 1 Trung tâm duy nhất 1 lần
userCenterSchema.index({ userId: 1, centerId: 1 }, { unique: true });

module.exports = mongoose.model('UserCenter', userCenterSchema);
