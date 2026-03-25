const mongoose = require("mongoose");
const crypto = require("crypto");

const nodeSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    questions: [
      {
        id: { 
          type: String, 
          required: true,
          default: () => crypto.randomUUID()
        },
        content: { type: String, required: true }
      }
    ],
    isOpen: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

nodeSchema.index({ courseId: 1, order: 1 }, { unique: true });

module.exports = mongoose.model("Node", nodeSchema);
