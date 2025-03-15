const express = require('express');
const router = express.Router();
const unitController = require('../controllers/unit.controller');
const { protect } = require('../../middlewares/authMiddleware');

// Unit routes
router
  .route('/:courseId/units')
  .get(unitController.getAllUnits)
  .post(unitController.uploadCourseFiles, unitController.createUnit);

router
  .route('/units/:id')
  .get(unitController.getUnitById)
  .put(unitController.uploadCourseFiles, unitController.updateUnit)
  .delete(unitController.deleteUnit);

module.exports = router;
