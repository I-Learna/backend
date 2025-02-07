const { param } = require('express-validator');
const mongoose = require('mongoose');

const validateObjectId = [
  param('id')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid ID format');
      }
      return true;
    })
    .withMessage('Invalid MongoDB ObjectId'),
];

module.exports = validateObjectId;
