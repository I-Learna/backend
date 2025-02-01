const express = require('express');
const User = require('../controllers/auth.controller');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/rbacMiddleware');
const userValidationRules = require('../validation/userValidationRules');
const validateRequest = require('../middlewares/validationRequest');
const passport = require('../utils/passportConfig');

const router = express.Router();

router.post('/register', validateRequest(userValidationRules), User.registerUser);
router.post('/login', User.loginUser);
router.get('/logout', User.logoutUser);
router.post('/forget-password', User.forgotPassword);
router.post('/reset-password', User.resetPassword);
router.post('/change-password', User.changePassword);

// Google OAuth routes
router.get('/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    User.googleAuth
);

// LinkedIn callback
router.get('/linkedin', passport.authenticate('linkedin'));
router.get('/linkedin/callback',
    passport.authenticate('linkedin', { failureRedirect: '/login' }),
    User.linkedInAuth
);

router.post('/assign-role', protect, authorize('updateAny', 'role'), assignRole);

module.exports = router;
