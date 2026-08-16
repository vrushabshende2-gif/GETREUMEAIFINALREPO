const mongoose = require('mongoose');

const applicantSchema = mongoose.Schema({
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
  status: {
    type: String,
    enum: ['Applied', 'Interviewing', 'Offered', 'Rejected'],
    default: 'Applied'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  }
});

const jobSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a position title']
    },
    company: {
      type: String,
      required: [true, 'Please add a company name']
    },
    location: {
      type: String,
      required: [true, 'Please add job location']
    },
    description: {
      type: String,
      required: [true, 'Please add business description']
    },
    requirements: {
      type: [String],
      default: []
    },
    salary: {
      type: String,
      default: 'Not specified'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    applicants: [applicantSchema]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Job', jobSchema);
