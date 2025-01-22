const express = require('express');
const { registerUser, loginUser, assignRole } = require('../controllers/auth.controller');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/rbacMiddleware');
const userValidationRules = require('../validation/userValidationRules');
const validateRequest = require('../middlewares/validationRequest');

const router = express.Router();

router.post('/register', validateRequest(userValidationRules), registerUser);
router.post('/login', loginUser);


router.post('/assign-role', protect, authorize('updateAny', 'role'), assignRole);


module.exports = router;
