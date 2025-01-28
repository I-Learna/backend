const express = require('express');
const { registerUser, loginUser, assignRole, logoutUser, googleAuth, linkedInAuth, resetPassword } = require('../controllers/auth.controller');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/rbacMiddleware');
const passport = require('../utils/passportConfig');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', logoutUser);
router.post('/reset-password', resetPassword);

// Google OAuth routes
router.get('/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    googleAuth
);



// LinkedIn callback
router.get('/linkedin', passport.authenticate('linkedin'));
router.get('/linkedin/callback',
    passport.authenticate('linkedin', { failureRedirect: '/login' }),
    linkedInAuth
);
router.post('/assign-role', protect, authorize('updateAny', 'role'), assignRole);


module.exports = router;
