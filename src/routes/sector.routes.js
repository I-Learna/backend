const express = require('express');
const router = express.Router();
const {
  getAllSectors,
  getSectorById,
  createSector,
  updateSector,
  deleteSector,
} = require('../controllers/sector.controller');

const validateRequest = require('../middlewares/validationRequest');
const { sectorCreateValidationRules, sectorUpdateValidationRules } = require('../validation/sectorValidationRule');
const validateObjectId = require('../validation/validateObjectId');

router.route('/')
  .get(getAllSectors)
  .post(validateRequest(sectorCreateValidationRules), createSector)

router.route('/:id')
  .get(validateRequest(validateObjectId), getSectorById)
  .put(validateRequest(sectorUpdateValidationRules), updateSector)
  .delete(validateRequest(validateObjectId), deleteSector)

module.exports = router;
