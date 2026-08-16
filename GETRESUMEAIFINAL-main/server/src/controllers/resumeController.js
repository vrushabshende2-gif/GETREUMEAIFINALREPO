const User = require('../models/User');
const Resume = require('../models/Resume');
const { calculateATSScore } = require('../services/atsService');
// Helper to enforce that one email maps to exactly one name across all resumes
const enforceEmailNameBinding = async (userId, body) => {
  if (!body.personalInfo) return;
  const email = body.personalInfo.email;
  let name = body.personalInfo.name || body.personalInfo.fullName;

  if (email && email.trim()) {
    // 1. Check if another user profile is registered with this email
    const registeredUser = await User.findOne({ email: email.toLowerCase() });
    
    // 2. Check if any resume in the database is using this email
    const otherResume = await Resume.findOne({
      "personalInfo.email": email.toLowerCase(),
      // Check across ALL users' resumes to prevent name swapping
    });

    let boundName = '';
    if (registeredUser?.name) {
      boundName = registeredUser.name;
    } else if (otherResume?.personalInfo?.name) {
      boundName = otherResume.personalInfo.name;
    } else if (otherResume?.personalInfo?.fullName) {
      boundName = otherResume.personalInfo.fullName;
    }

    if (boundName && name && name.trim().toLowerCase() !== boundName.trim().toLowerCase()) {
      // Override the submitted name to enforce global consistency for this email
      body.personalInfo.name = boundName;
      body.personalInfo.fullName = boundName;
    }
  }
};

// @desc    Get all user resumes
// @route   GET /api/resume
// @access  Private
const getResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id }).sort({ updatedAt: -1 });
    res.json(resumes);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single resume
// @route   GET /api/resume/:id
// @access  Private
const getResumeById = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      res.status(404);
      throw new Error('Resume not found');
    }

    if (resume.userId.toString() !== req.user.id.toString()) {
      res.status(401);
      throw new Error('User not authorized');
    }

    res.json(resume);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new resume
// @route   POST /api/resume
// @access  Private
const createResume = async (req, res, next) => {
  try {
    if (!req.body.title) {
      res.status(400);
      throw new Error('Please add a title');
    }

    // Enforce name-email binding consistency
    await enforceEmailNameBinding(req.user.id, req.body);

    // Calculate ATS Score before saving
    const atsResult = calculateATSScore(req.body);

    const resume = await Resume.create({
      ...req.body,
      userId: req.user.id,
      atsScore: atsResult.score,
    });

    const updateData = {
      name: req.body.personalInfo?.name || req.body.personalInfo?.fullName || undefined,
      phone: req.body.personalInfo?.phone || undefined,
      location: req.body.personalInfo?.location || undefined,
      linkedin: req.body.personalInfo?.linkedin || undefined,
      summary: req.body.summary || undefined,
    };
    if (req.body.education) updateData.education = req.body.education;
    if (req.body.experience) updateData.experience = req.body.experience;
    if (req.body.internships) updateData.internships = req.body.internships;
    if (req.body.skills) updateData.skills = req.body.skills;
    if (req.body.projects) updateData.projects = req.body.projects;
    
    // Clean undefined fields
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
    
    await User.findByIdAndUpdate(req.user.id, updateData);

    res.status(201).json(resume);
  } catch (error) {
    next(error);
  }
};

// @desc    Update resume
// @route   PUT /api/resume/:id
// @access  Private
const updateResume = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      res.status(404);
      throw new Error('Resume not found');
    }

    if (resume.userId.toString() !== req.user.id.toString()) {
      res.status(401);
      throw new Error('User not authorized');
    }

    // Enforce name-email binding consistency
    await enforceEmailNameBinding(req.user.id, req.body);

    // Recalculate ATS Score on update
    const atsResult = calculateATSScore(req.body);

    const updatedResume = await Resume.findByIdAndUpdate(
      req.params.id,
      { ...req.body, atsScore: atsResult.score },
      { new: true }
    );

    const updateData = {
      name: req.body.personalInfo?.name || req.body.personalInfo?.fullName || undefined,
      phone: req.body.personalInfo?.phone || undefined,
      location: req.body.personalInfo?.location || undefined,
      linkedin: req.body.personalInfo?.linkedin || undefined,
      summary: req.body.summary || undefined,
    };
    if (req.body.education) updateData.education = req.body.education;
    if (req.body.experience) updateData.experience = req.body.experience;
    if (req.body.internships) updateData.internships = req.body.internships;
    if (req.body.skills) updateData.skills = req.body.skills;
    if (req.body.projects) updateData.projects = req.body.projects;
    
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
    
    await User.findByIdAndUpdate(req.user.id, updateData);

    res.json(updatedResume);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete resume
// @route   DELETE /api/resume/:id
// @access  Private
const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      res.status(404);
      throw new Error('Resume not found');
    }

    if (resume.userId.toString() !== req.user.id.toString()) {
      res.status(401);
      throw new Error('User not authorized');
    }

    await resume.deleteOne();

    res.json({ id: req.params.id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getResumes,
  getResumeById,
  createResume,
  updateResume,
  deleteResume,
};

