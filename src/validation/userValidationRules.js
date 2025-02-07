const { body } = require('express-validator');
const User = require('../model/user.model'); // Adjust the path to your User model

const userValidationRules = [
  // Validate name
  body('name')
    .isLength({ min: 3, max: 50 })
    .withMessage('Name must be between 3 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name must contain only letters and spaces')
    .trim()
    .escape(),

  // Validate email
  body('email')
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail()
    .custom(async (email) => {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('Email already in use');
      }
    }),

  // Validate password
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long!')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character!'
    ),

  body('confirmPassword')
    .isLength({ min: 8 })
    .withMessage('Confirm Password must be at least 8 characters long!')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Confirm Password must match Password');
      }
      return true;
    }),

  // Validate role
  body('role')
    .optional()
    .isIn(['User', 'Admin', 'OperationTeam', 'PaymentTeam', 'Freelancer'])
    .withMessage('Role must be one of iLearna supported teams')
    .default('User'),
];

module.exports = userValidationRules;
