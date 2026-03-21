const mongoose = require('mongoose');

const classMemberSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
});

// Chống trùng lặp 1 học sinh tham gia 1 lớp 2 lần
classMemberSchema.index({ classId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('ClassMember', classMemberSchema);
