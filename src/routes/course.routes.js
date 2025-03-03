const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const { protect } = require('../middlewares/authMiddleware');

// Course routes
router
  .route('/')
  .get(courseController.getAllCourses)
  .post(courseController.uploadCourseFiles, courseController.createCourse);

router
  .route('/:id')
  .get(courseController.getCourseById)
  .put(courseController.uploadCourseFiles, courseController.updateCourse)
  .delete(courseController.deleteCourse);

// Unit routes
router
  .route('/:courseId/units')
  .get(courseController.getAllUnits)
  .post(courseController.uploadCourseFiles, courseController.createUnit);

router
  .route('/:courseId/units/:id')
  .get(courseController.getUnitById)
  .put(courseController.uploadCourseFiles, courseController.updateCourse);
router.delete('/units/:id', courseController.deleteCourse);

router.put('/:courseId/approve', courseController.approveCourse);
router.put('/:courseId/publish', courseController.publishCourse);

// Session routes
router
  .route('/:unitId/sessions')
  .get(courseController.getAllSessions)
  .post(courseController.uploadCourseFiles, courseController.createSession);

router
  .route('/:unitId/sessions/:id')
  .get(courseController.getSessionById)
  .put(courseController.uploadCourseFiles, courseController.updateCourse);
router.delete('/sessions/:id', courseController.deleteCourse);

// Review routes
router.post('/reviews', protect, courseController.createReview);
router.get('/reviews/:refId/:refType', courseController.getReviews);

//Question routes
router.post('/questions', protect, courseController.createQuestion);
router.post('/questions/:qaId/answers', protect, courseController.addAnswer);
router.get('/questions/:refId/:refType', courseController.getQuestions);

module.exports = router;
