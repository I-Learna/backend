const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const utilsController = require('../controllers/utils.controller');
const { protect } = require('../../middlewares/authMiddleware');

router.get('/publishedcourses', courseController.getPublishedCourses);
router.get('/freelancer', protect, courseController.getAllCoursesByFreelancerId);
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






// public route for any user register or not
// /recordedcourses     ( for published courses only )
// /recordedcourses/:id    ( for published courses only )
// /recordedcourses/:id/instructorCourses     ( for published courses only )
// /recordedcourses/:id/reviews    ( for published courses only )

// CRUD recordedCourses
// /freelancer/recordedCourses create recordedCourse - only freelancer ( protected ,  freelancer authorzied ,confirm the freelancer came from token )
// /freelancer/recordedCourses update recordedCourse - only freelancer ( protected ,  freelancer authorzied ,confirm the freelancer came from token )
// /freelancer/recordedCourses delete recordedCourseBeforePublish - only freelancer (protected , freelancer authorzied , confirm the freelancer came from token)
// /freelancer/recordedCourses read allrecordedCourseCreatedByFreelancer - by the same freelancer id ( protected , freelancer authorzied ,confirm the freelancer came from token)

// /admin/recordedCourses  read allRecordedCourse - only admin ( protected , admin authorzied ,confirm the admin came from token) 
// /admin/recordedCourses  delete recordedCourse - only admin (protected , admin authorzied ,confirm the admin came from token ) 
// /admin/recordedCourses/:id/approve  patch- only admin (protected , admin authorzied ,confirm the admin came from token )
// /admin/recordedCourses/:id/publish  patch- only admin(protected , admin authorzied ,confirm the admin came from token )
