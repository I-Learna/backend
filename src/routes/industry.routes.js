const express = require('express');
const router = express.Router();
const {
  getAllIndustries,
  getIndustryById,
  createIndustry,
  updateIndustry,
  deleteIndustry,
} = require('../controllers/industry.controller');
const validateIndustry = require('../middlewares/industryValidationMiddleware');

router.route('/')
  .get(getAllIndustries)
  .post(validateIndustry, createIndustry)

router.route('/:id')
  .get(getIndustryById)
  .put(updateIndustry)
  .delete(deleteIndustry)

module.exports = router;
