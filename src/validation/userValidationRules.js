const { body } = require('express-validator');
const User = require('../models/user.model'); // Adjust the path to your User model

const userValidationRegistration = [
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

const userValidationLogin = [
  // Validate email
  body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),

  // Validate password
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long!')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character!'
    ),
];

const userValidationEmail = [
  // Validate email
  body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
];

const userValidationResetPassword = [
  // Validate password newPassword, confirmPassword
  body('newPassword')
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
      if (value !== req.body.newPassword) {
        throw new Error('Confirm Password must match Password');
      }
      return true;
    }),
];

const userValidationChangePassword = [
  // Validate oldPassword, newPassword, confirmPassword
  body('oldPassword')
    .isLength({ min: 8 })
    .withMessage('Old Password must be at least 8 characters long!')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character!'
    ),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New Password must be at least 8 characters long!')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character!'
    ),

  body('confirmPassword')
    .isLength({ min: 8 })
    .withMessage('Confirm Password must be at least 8 characters long!')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Confirm Password must match Password');
      }
      return true;
    }),
];

module.exports = {
  userValidationRegistration,
  userValidationLogin,
  userValidationEmail,
  userValidationResetPassword,
  userValidationChangePassword,
};
