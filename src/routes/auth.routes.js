const express = require('express');
const User = require('../controllers/auth.controller');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/rbacMiddleware');
const {
  userValidationRegistration,
  userValidationLogin,
  userValidationEmail,
  userValidationResetPassword,
  userValidationChangePassword,
} = require('../validation/userValidationRules');
const validateRequest = require('../middlewares/validationRequest');
const passport = require('../utils/passportConfig');

const router = express.Router();

router.post('/register', validateRequest(userValidationRegistration), User.registerUser);
router.get('/activate/:token', User.activateUser);
router.patch('/admin/user/status', User.updateUserStatus);
router.get('/refresh-token', User.refreshToken);
router.post('/login', validateRequest(userValidationLogin), User.loginUser);
router.get('/logout', User.logoutUser);
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

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  User.googleAuth
);

// LinkedIn callback
router.get('/linkedin', passport.authenticate('linkedin'));
router.get(
  '/linkedin/callback',
  passport.authenticate('linkedin', { failureRedirect: '/login' }),
  User.linkedInAuth
);

// Instructor
router.post('/request-instructor', protect, User.uploadInstructorFiles, User.requestInstructor);
router.post('/review-instructor', protect, User.reviewInstructorRequest);

// Role
router.post('/assign-role', protect, authorize('updateAny', 'role'), User.assignRole);

module.exports = router;
