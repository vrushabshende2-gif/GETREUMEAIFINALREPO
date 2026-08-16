const mongoose = require('mongoose');

const answeredQuestionSchema = mongoose.Schema({
  questionText: {
    type: String,
    required: true
  },
  selectedOptionIndex: {
    type: Number,
    required: true
  },
  correctOptionIndex: {
    type: Number,
    required: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  },
  explanation: {
    type: String
  }
});

const testResultSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true
    },
    score: {
      type: Number,
      required: true
    },
    totalQuestions: {
      type: Number,
      default: 10
    },
    correctAnswers: {
      type: Number,
      required: true
    },
    switchStrikes: {
      type: Number,
      default: 0
    },
    answers: [answeredQuestionSchema],
    completedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('TestResult', testResultSchema);
