const mongoose = require("mongoose");

const reflectionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    nodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Node",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 500,
    },
    questionId: {
      type: String,
      required: true,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);
reflectionSchema.index({ studentId: 1, questionId: 1 }, { unique: true });

// Sự kiện drop index cũ tránh lỗi 11000
mongoose.connection.on('connected', async () => {
  try {
    const db = mongoose.connection.db;
    if (db) {
      await mongoose.model('Reflection').collection.dropIndex('studentId_1_nodeId_1').catch(() => {});
      await mongoose.model('Reflection').collection.dropIndex('studentId_1_nodeId_1_question_1').catch(() => {});
      console.log('Đã dọn dẹp Unique Index cũ của bảng Reflection!');
    }
  } catch (error) {
    // Bỏ qua nếu collection chưa tồn tại hoặc index không có
  }
});

module.exports = mongoose.model("Reflection", reflectionSchema);
