const express = require('express');
const { registerUser, loginUser, assignRole, logoutUser, googleAuth } = require('../controllers/auth.controller');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/rbacMiddleware');
const passport = require('../utils/passportConfig');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', logoutUser);

// Google OAuth routes
router.get('/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    googleAuth
);

router.post('/assign-role', protect, authorize('updateAny', 'role'), assignRole);


module.exports = router;
