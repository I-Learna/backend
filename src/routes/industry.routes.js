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
const { industryCreateValidationRules, industryUpdateValidationRules } = require('../validation/industryValidationRule');
const validateObjectId = require('../validation/validateObjectId');

router.route('/')
  .get(getAllIndustries)
  .post(validateRequest(industryCreateValidationRules), createIndustry)


router.route('/:id')
  .get(validateRequest(validateObjectId), getIndustryById)
  .put(validateRequest(industryUpdateValidationRules), updateIndustry)
  .delete(validateRequest(validateObjectId), deleteIndustry)

module.exports = router;
