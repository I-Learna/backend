const express = require('express');
const router = express.Router();
const {
  getAllIndustries,
  getIndustryById,
  createIndustry,
  updateIndustry,
  deleteIndustry,
} = require('../controllers/industry.controller');

    router.route('/')
        .get(getAllIndustries)
        .post(createIndustry)

    router.route('/:id')
        .get(getIndustryById)
        .put(updateIndustry)
        .delete(deleteIndustry)

module.exports = router;
