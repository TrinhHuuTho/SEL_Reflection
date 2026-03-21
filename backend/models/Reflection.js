const mongoose = require("mongoose");

const EMOTION_VALUES = ["happy", "sad", "neutral", "confused", "angry"];

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
    emotion: {
      type: String,
      enum: EMOTION_VALUES,
      default: null,
    },
    character: {
      type: String,
      trim: true,
      default: null,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    version: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

reflectionSchema.index({ studentId: 1, nodeId: 1 }, { unique: true });

module.exports = mongoose.model("Reflection", reflectionSchema);
