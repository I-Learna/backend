const express = require('express');
const router = express.Router();
const {
  getAllSectors,
  getSectorById,
  createSesctor,
  updateSector,
  deleteSector,
} = require('../controllers/sector.controller');

    router.route('/')
        .get(getAllSectors)
        .post(createSesctor)

    router.route('/:id')
        .get(getSectorById)
        .put(updateSector)
        .delete(deleteSector)

module.exports = router;
