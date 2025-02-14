const express = require('express');
const router = express.Router();
const ebookController = require('../controllers/ebook.controller');

router.route('/').get(ebookController.getEbooks).post(ebookController.createEbook);

router
  .route('/:id')
  .get(ebookController.getEbookById)
  .put(ebookController.updateEbook)
  .delete(ebookController.deleteEbook);

module.exports = router;
