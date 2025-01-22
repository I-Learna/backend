const express = require('express');
const router = express.Router();
const {
  getAllIndustries,
  getIndustryById,
  createIndustry,
  updateIndustry,
  deleteIndustry,
} = require('../controllers/industry.controller');

const validateRequest = require('../middlewares/validationRequest');
const industryValidationRules = require('../validation/industryValidationRule');

router.route('/')
  .get(getAllIndustries)
  .post(validateRequest(industryValidationRules), createIndustry)

router.route('/:id')
  .get(getIndustryById)
  .put(validateRequest(industryValidationRules), updateIndustry)
  .delete(deleteIndustry)

module.exports = router;
