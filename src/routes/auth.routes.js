const express = require('express');
const { registerUser, loginUser, assignRole } = require('../controllers/auth.controller');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/rbacMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

router.post('/assign-role', protect, authorize('updateAny', 'role'), assignRole);


module.exports = router;
