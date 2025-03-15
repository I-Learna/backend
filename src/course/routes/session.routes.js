const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/session.controller');
const { protect } = require('../../middlewares/authMiddleware');

// Session routes
router
  .route('/:unitId/sessions')
  .get(sessionController.getAllSessions)
  .post(sessionController.uploadCourseFiles, sessionController.createSession);

router
  .route('/sessions/:id')
  .get(sessionController.getSessionById)
  .put(sessionController.uploadCourseFiles, sessionController.updateSession)
  .delete(sessionController.deleteSession);

module.exports = router;
