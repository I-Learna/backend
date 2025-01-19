const express = require('express');
const router = express.Router();
const {
  getAllIndustries,
  getIndustryById,
  createIndustry,
  updateIndustry,
  deleteIndustry,
} = require('../controllers/industry.controller');

const validateRequest = require('../middlewares/validateRequestMiddleware');
const industryValidationSchema = require('../validation/industryValidationSchema');

router.route('/')
  .get(getAllIndustries)
  .post(validateRequest(industryValidationSchema), createIndustry)

router.route('/:id')
  .get(getIndustryById)
  .put(validateRequest(industryValidationSchema), updateIndustry)
  .delete(deleteIndustry)

module.exports = router;
