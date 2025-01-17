const express = require('express');
const { createCoupon, redeemCoupon } = require('../controllers/coupon.controller');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/create', protect, createCoupon); // Only Admins
router.post('/redeem', protect, redeemCoupon); // Only Users

module.exports = router;
