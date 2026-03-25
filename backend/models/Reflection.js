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

module.exports = mongoose.model("Reflection", reflectionSchema);
