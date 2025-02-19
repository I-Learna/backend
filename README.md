## update validation error for routers auth router

```
const {
  userValidationRegistration,
  userValidationLogin,
  userValidationEmail,
  userValidationResetPassword,
  userValidationChangePassword,
} = require('../validation/userValidationRules');


router.post('/login', validateRequest(userValidationLogin), User.loginUser);


router.post('/forget-password', validateRequest(userValidationEmail), User.forgotPassword);
router.post(
  '/reset-password/:resetToken',
  validateRequest(userValidationResetPassword),
  User.resetPassword
);
router.post(
  '/change-password',
  protect,
  validateRequest(userValidationChangePassword),
  User.changePassword
);
```

## add validation rule in userValidationRule

```
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


```
