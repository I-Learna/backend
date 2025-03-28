const express = require('express');
const router = express.Router();
const courseController = require('../controllers/liveCourse.controller');
const utilsController = require('../controllers/utils.controller');
const { protect } = require('../../middlewares/authMiddleware');

router.get('/publishedcourses', courseController.getPublishedCourses);
router.get('/freelancer', protect, courseController.getAllCoursesByFreelancerId);
router.get('/:courseId/instructors', courseController.getAllFreelancersForCourse);
router.get('/enrollrequests', utilsController.getAllInstructorLiveEnrollRequests);
router.put('/:courseId/approve', courseController.approveCourse);
router.put('/:courseId/publish', courseController.publishCourse);

router.post('/:courseId/instructor/enroll', protect, utilsController.enrollInstructor);
router.post('/instructor/:requestId/approve', protect, utilsController.handleInstructorApproval);

// Course routes
router
  .route('/')
  .get(courseController.getAllCourses)
  .post(protect, courseController.uploadCourseFiles, courseController.createCourse);

router
  .route('/:id')
  .get(courseController.getCourseById)
  .put(protect, courseController.uploadCourseFiles, courseController.updateCourse)
  .put(courseController.deleteCourse);

// Review routes
router.post('/reviews', protect, utilsController.createReview);
router.get('/reviews/:course', utilsController.getReviews);

//Question routes
router.post('/questions', protect, utilsController.createQuestion);
router.post('/questions/:qaId/answers', protect, utilsController.addAnswer);
router.get('/questions/:course', utilsController.getQuestions);

module.exports = router;
