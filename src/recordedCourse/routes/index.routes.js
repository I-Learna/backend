const express = require('express');
const router = express.Router();

// Import all route files
const recordedCourseRoutes = require('./recordedCourse.routes');
const unitRoutes = require('./unit.routes');
const sessionRoutes = require('./session.routes');

// Use routes with prefixes
router.use('', recordedCourseRoutes);
router.use('', unitRoutes);
router.use('', sessionRoutes);

// Export the combined router
module.exports = router;
