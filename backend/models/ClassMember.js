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

classMemberSchema.index({ studentId: 1 }, { unique: true });

module.exports = mongoose.model('ClassMember', classMemberSchema);