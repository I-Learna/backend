
const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');
const {
    getUserDashboard,
    getInstructorDashboard,
    getOperationDashboard,
    getPaymentDashboard
} = require('../controllers/dashboard.controller');

const router = express.Router();

// user dash
router.get('/user', protect, authorizeRoles('User'), getUserDashboard);

// instructor dash
router.get('/instructor', protect, authorizeRoles('Admin'), getInstructorDashboard);

// operation team dash
router.get('/operation', protect, authorizeRoles('OperationTeam'), getOperationDashboard);

// payment team dash
router.get('/payment', protect, authorizeRoles('PaymentTeam'), getPaymentDashboard);

module.exports = router;
