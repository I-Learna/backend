const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');

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
  .put(courseController.uploadCourseFiles, courseController.updateCourse)
  .delete(courseController.deleteCourse);

// Session routes
router
  .route('/:unitId/sessions')
  .get(courseController.getAllSessions)
  .post(courseController.uploadCourseFiles, courseController.createSession);

router
  .route('/:unitId/sessions/:id')
  .get(courseController.getSessionById)
  .put(courseController.uploadCourseFiles, courseController.updateCourse)
  .delete(courseController.deleteCourse);

module.exports = router;
