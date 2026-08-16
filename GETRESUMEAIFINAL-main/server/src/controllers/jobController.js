const Job = require('../models/Job');
const Resume = require('../models/Resume');
const User = require('../models/User');
const { calculateATSScore } = require('../services/atsService');

/**
 * @desc    Get all jobs
 * @route   GET /api/jobs
 * @access  Private (Registered users)
 */
const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({}).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error('Fetch Jobs Error:', error);
    res.status(500).json({ message: 'Failed to retrieve job openings' });
  }
};

/**
 * @desc    Create a new job posting
 * @route   POST /api/jobs
 * @access  Private/Admin
 */
const createJob = async (req, res) => {
  try {
    // Basic Admin authorization check
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden. Admin privileges required.' });
    }

    const { title, company, location, description, requirements, salary } = req.body;

    if (!title || !company || !location || !description) {
      return res.status(400).json({ message: 'Title, company, location, and description are required' });
    }

    const job = await Job.create({
      title,
      company,
      location,
      description,
      requirements: Array.isArray(requirements) ? requirements : requirements ? requirements.split(',').map(r => r.trim()) : [],
      salary: salary || 'Not specified',
      createdBy: req.user._id,
      applicants: []
    });

    res.status(201).json(job);
  } catch (error) {
    console.error('Create Job Error:', error);
    res.status(500).json({ message: 'Failed to create job posting' });
  }
};

/**
 * @desc    Apply to a job listing
 * @route   POST /api/jobs/:id/apply
 * @access  Private
 */
const applyJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const { resumeId } = req.body;

    if (!resumeId) {
      return res.status(400).json({ message: 'Resume selection is required to apply' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if matching Resume exists and belongs to the user
    const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'Selected resume not found or unauthorized' });
    }

    // Verify if user already applied to this job
    const alreadyApplied = job.applicants.some(
      app => app.userId.toString() === req.user._id.toString()
    );

    if (alreadyApplied) {
      return res.status(400).json({ message: 'You have already applied to this job listing' });
    }

    // Apply
    job.applicants.push({
      userId: req.user._id,
      resumeId: resume._id,
      status: 'Applied',
      appliedAt: new Date()
    });

    await job.save();
    res.json({ message: 'Application submitted successfully!', job });
  } catch (error) {
    console.error('Apply Job Error:', error);
    res.status(500).json({ message: 'Failed to submit job application' });
  }
};

/**
 * @desc    Delete a job posting
 * @route   DELETE /api/jobs/:id
 * @access  Private/Admin
 */
const deleteJob = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden. Admin privileges required.' });
    }

    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job posting not found' });
    }

    res.json({ message: 'Job posting deleted successfully' });
  } catch (error) {
    console.error('Delete Job Error:', error);
    res.status(500).json({ message: 'Failed to delete job posting' });
  }
};

/**
 * @desc    Get applicants for a job posting
 * @route   GET /api/jobs/:id/applicants
 * @access  Private/Admin
 */
const getJobApplicants = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden. Admin privileges required.' });
    }

    const job = await Job.findById(req.params.id)
      .populate('applicants.userId', 'name email')
      .populate('applicants.resumeId', 'title atsScore updatedAt');

    if (!job) {
      return res.status(404).json({ message: 'Job posting not found' });
    }

    res.json(job.applicants);
  } catch (error) {
    console.error('Fetch Applicants Error:', error);
    res.status(500).json({ message: 'Failed to load applicant list' });
  }
};

/**
 * @desc    Get recommended candidates for a job listing (calculated from all database resumes)
 * @route   GET /api/jobs/:id/recommendations
 * @access  Private/Admin
 */
const getRecommendedCandidates = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden. Admin privileges required.' });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job posting not found' });
    }

    // Fetch all user resumes, populating user details
    const resumes = await Resume.find({}).populate('userId', 'name email phone');

    // Group by userId, keeping only the highest scoring resume for each user to prevent duplicate students
    const userRecommendations = {};
    for (const resume of resumes) {
      if (!resume.userId) continue;
      const userIdStr = resume.userId._id.toString();

      // Calculate the match score based on job description
      const atsResult = calculateATSScore(resume, job.description);

      const candidateInfo = {
        userId: resume.userId._id,
        name: resume.userId.name || 'Guest Student',
        email: resume.userId.email || 'N/A',
        phone: resume.personalInfo?.phone || resume.userId.phone || 'N/A',
        resumeId: resume._id,
        resumeTitle: resume.title || 'Main Resume',
        score: atsResult.score,
        matchedKeywords: atsResult.matchedKeywordsList || [],
        missingKeywords: atsResult.missingKeywords || [],
        wordCount: atsResult.wordCount
      };

      if (!userRecommendations[userIdStr] || atsResult.score > userRecommendations[userIdStr].score) {
        userRecommendations[userIdStr] = candidateInfo;
      }
    }

    // Convert to sorted array descending by match score
    const sortedRecommendations = Object.values(userRecommendations)
      .sort((a, b) => b.score - a.score);

    res.json(sortedRecommendations);
  } catch (error) {
    console.error('Fetch Recommendations Error:', error);
    res.status(500).json({ message: 'Failed to load recommended candidates list' });
  }
};

/**
 * @desc    Update an applicant's stage status (Admin only)
 * @route   PUT /api/jobs/:id/applicants/:applicantId/status
 * @access  Private/Admin
 */
const updateApplicantStatus = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden. Admin privileges required.' });
    }

    const { status } = req.body;
    const validStatuses = ['Applied', 'Interviewing', 'Offered', 'Rejected'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job posting not found' });
    }

    const applicant = job.applicants.id(req.params.applicantId);
    if (!applicant) {
      return res.status(404).json({ message: 'Applicant record not found' });
    }

    applicant.status = status;
    await job.save();

    res.json({ message: 'Applicant status updated successfully', applicant });
  } catch (error) {
    console.error('Update Applicant Status Error:', error);
    res.status(500).json({ message: 'Failed to update applicant status' });
  }
};

/**
 * @desc    Get user's applied jobs with stage tracking for Kanban pipeline
 * @route   GET /api/jobs/my-applications
 * @access  Private
 */
const getMyApplications = async (req, res) => {
  try {
    const jobs = await Job.find({ 'applicants.userId': req.user._id })
      .select('title company location salary description applicants createdAt')
      .populate('applicants.resumeId', 'title atsScore');

    const applications = jobs.map((job) => {
      const myApp = job.applicants.find(
        (a) => a.userId.toString() === req.user._id.toString()
      );
      return {
        _id: myApp?._id || job._id,
        jobId: job._id,
        title: job.title,
        company: job.company,
        location: job.location,
        salary: job.salary,
        status: myApp?.status || 'Applied',
        appliedAt: myApp?.appliedAt || job.createdAt,
        resume: myApp?.resumeId,
      };
    });

    res.json(applications);
  } catch (error) {
    console.error('Get User Applications Error:', error);
    res.status(500).json({ message: 'Failed to retrieve applications' });
  }
};

module.exports = {
  getJobs,
  createJob,
  applyJob,
  deleteJob,
  getJobApplicants,
  getRecommendedCandidates,
  updateApplicantStatus,
  getMyApplications
};

