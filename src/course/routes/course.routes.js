const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const utilsController = require('../controllers/utils.controller');
const { protect } = require('../../middlewares/authMiddleware');

router.get('/publishedcourses', courseController.getPublishedCourses);
router.get('/user/:userId', courseController.getAllCoursesByUserId);
router.put('/:courseId/approve', courseController.approveCourse);
router.put('/:courseId/publish', courseController.publishCourse);

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
