
const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/rbacMiddleware');
const { getDashboard } = require('../controllers/dashboard.controller');

const router = express.Router();

router.get('/', protect, authorize('dashboard', 'access'), getDashboard);



module.exports = router;
