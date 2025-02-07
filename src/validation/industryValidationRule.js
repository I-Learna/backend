const { body, param } = require('express-validator');
const mongoose = require('mongoose');

const industryCreateValidationRules = [
  // Validate name (English letters only)
  body('name')
    .isString()
    .withMessage('Name must be a string')
    .matches(/^[a-zA-Z\s-]+$/)
    .withMessage('Name must contain only English letters')
    .notEmpty()
    .withMessage('Name is required'),

  // Validate name_ar (Arabic letters only)
  body('name_ar')
    .isString()
    .withMessage('Arabic name must be a string')
    .matches(/^[\u0621-\u064A\s-]+$/)
    .withMessage('Arabic name must contain only Arabic letters')
    .notEmpty()
    .withMessage('Arabic name is required'),
];

const industryUpdateValidationRules = [
  param('id').custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error('Invalid ID format');
    }
    return true;
  }),
  // Validate name (English letters only)
  body('name')
    .isString()
    .withMessage('Name must be a string')
    .matches(/^[a-zA-Z\s-]+$/)
    .withMessage('Name must contain only letters')
    .notEmpty()
    .withMessage('Name is required'),

  // Validate name_ar (Arabic letters only)
  body('name_ar')
    .isString()
    .withMessage('Arabic name must be a string')
    .matches(/^[\u0621-\u064A\s-]+$/)
    .withMessage('Arabic name must contain only Arabic letters')
    .notEmpty()
    .withMessage('Arabic name is required'),
];

module.exports = {
  industryCreateValidationRules,
  industryUpdateValidationRules,
};
