const express = require('express');
const router = express.Router();
const { 
  getJobs, 
  createJob, 
  applyJob, 
  deleteJob, 
  getJobApplicants,
  getRecommendedCandidates,
  updateApplicantStatus,
  getMyApplications
} = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getJobs);
router.get('/my-applications', getMyApplications);
router.post('/', createJob);
router.post('/:id/apply', applyJob);
router.delete('/:id', deleteJob);
router.get('/:id/applicants', getJobApplicants);
router.put('/:id/applicants/:applicantId/status', updateApplicantStatus);
router.get('/:id/recommendations', getRecommendedCandidates);

module.exports = router;

