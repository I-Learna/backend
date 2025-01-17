const express = require('express');
const { createCoupon, redeemCoupon, getAllCoupons, getCouponByCode } = require('../controllers/coupon.controller');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/create', protect, createCoupon); // Only Admins
router.post('/redeem', protect, redeemCoupon); // Only Users
router.get('/all', protect, getAllCoupons);
router.get('/code/:code', protect, getCouponByCode);

module.exports = router;
