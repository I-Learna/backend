const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');

router.route('/').post(courseController.createCourse).get(courseController.getAllCourses);

router
  .route('/:id')
  .get(courseController.getCourseById)
  .put(courseController.updateCourse)
  .delete(courseController.deleteCourse);

module.exports = router;
