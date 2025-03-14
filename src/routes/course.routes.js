const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const { protect } = require('../middlewares/authMiddleware');

// Course routes
router
  .route('/')
  .get(courseController.getAllCourses)
  .post(protect, courseController.uploadCourseFiles, courseController.createCourse);

router
  .route('/:id')
  .get(courseController.getCourseById)
  .put(protect, courseController.uploadCourseFiles, courseController.updateCourse)
  .delete(courseController.deleteCourse);

// Unit routes
router
  .route('/:courseId/units')
  .get(courseController.getAllUnits)
  .post(courseController.uploadCourseFiles, courseController.createUnit);

router
  .route('/units/:id')
  .get(courseController.getUnitById)
  .put(courseController.uploadCourseFiles, courseController.updateUnit)
  .delete(courseController.deleteUnit);

router.put('/:courseId/approve', courseController.approveCourse);
router.put('/:courseId/publish', courseController.publishCourse);
router.get('/:courseId/allunits', courseController.findUnitsByCourseId);
router.get('/:unitId/allsessions', courseController.findSessionsByUnitId);

// Session routes
router
  .route('/:unitId/sessions')
  .get(courseController.getAllSessions)
  .post(courseController.uploadCourseFiles, courseController.createSession);

router
  .route('/sessions/:id')
  .get(courseController.getSessionById)
  .put(courseController.uploadCourseFiles, courseController.updateSession)
  .delete(courseController.deleteSession);

// Review routes
router.post('/reviews', protect, courseController.createReview);
router.get('/reviews/:course', courseController.getReviews);

//Question routes
router.post('/questions', protect, courseController.createQuestion);
router.post('/questions/:qaId/answers', protect, courseController.addAnswer);
router.get('/questions/:course', courseController.getQuestions);

module.exports = router;
