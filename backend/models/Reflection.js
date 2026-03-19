const mongoose = require('mongoose');

const EMOTION_VALUES = ['happy', 'sad', 'neutral', 'confused', 'angry'];

const reflectionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    journeyId: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    nodeId: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 500
    },
    emotion: {
      type: String,
      enum: EMOTION_VALUES,
      default: null
    },
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public'
    }
  },
  {
    timestamps: true
  }
);

reflectionSchema.index({ userId: 1, journeyId: 1, nodeId: 1 }, { unique: true });

module.exports = mongoose.model('Reflection', reflectionSchema);
