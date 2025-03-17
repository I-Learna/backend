const express = require('express');
const router = express.Router();

// Import all route files
const courseRoutes = require('./course.routes');
const unitRoutes = require('./unit.routes');
const sessionRoutes = require('./session.routes');

// Use routes with prefixes
router.use('', courseRoutes);
router.use('', unitRoutes);
router.use('', sessionRoutes);

// Export the combined router
module.exports = router;
