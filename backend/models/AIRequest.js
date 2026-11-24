const mongoose = require('mongoose');

const aiRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'AI request must belong to a user'],
      index: true
    },
    note: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note',
      required: [true, 'AI request must be associated with a note']
    },
    requestType: {
      type: String,
      enum: {
        values: ['summary', 'practice_questions', 'key_takeaways'],
        message: '{VALUE} is not a valid request type'
      },
      required: [true, 'Request type is required']
    },
    promptSnapshot: {
      type: String,
      required: true
    },
    response: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    status: {
      type: String,
      enum: ['success', 'failed'],
      default: 'success'
    },
    modelUsed: {
      type: String,
      default: 'gemini-3.8-flash'
    },
    durationMs: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

aiRequestSchema.index({ user: 1, createdAt: -1 });
aiRequestSchema.index({ createdAt: -1 });
aiRequestSchema.index({ requestType: 1 });

module.exports = mongoose.model('AIRequest', aiRequestSchema);
