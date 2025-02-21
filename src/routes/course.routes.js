const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');

router
  .route('/')
  .get(courseController.getAllCourses)
  .post(courseController.uploadCourseFiles, courseController.createCourse);

router
  .route('/:id')
  .get(courseController.getCourseById)
  .put(courseController.uploadCourseFiles, courseController.updateCourse)
  .delete(courseController.deleteCourse);

module.exports = router;
