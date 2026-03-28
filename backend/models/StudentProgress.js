const mongoose = require("mongoose");

const studentProgressSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    // Array các Node Id mà học sinh đã hoàn thành 100% câu hỏi
    completedNodes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Node",
      },
    ],
    // Tổng số lượt Submit câu hỏi thành công (Điểm chuyên cần)
    totalQuestionsAnswered: {
      type: Number,
      default: 0,
    },
    // Lần đăng nhập / nộp bài cuối cùng (Tránh học sinh ngủ quên)
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Học sinh chỉ có 1 thẻ Progress cho 1 Khóa Hành trình
studentProgressSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model("StudentProgress", studentProgressSchema);
