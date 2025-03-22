const express = require('express');
const router = express.Router();

// Import all route files
const liveCourseRoutes = require('./liveCourse.routes');
const unitRoutes = require('./unit.routes');
const sessionRoutes = require('./session.routes');

// Use routes with prefixes
router.use('', liveCourseRoutes);
router.use('', unitRoutes);
router.use('', sessionRoutes);

// Export the combined router
module.exports = router;
