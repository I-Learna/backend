const couponRepository = require('../repositories/coupon.repository');

// Create a new coupon (Admin Only)
exports.createCoupon = async (req, res) => {
  try {
    const { code, discount, type } = req.body;
    const creator = req.user;

    if (creator.role !== 'Admin') {
      return res.status(403).json({ message: 'Only admins can create coupons' });
    }

    const newCoupon = await couponRepository.create({
      code,
      discount,
      type,
      creator: { _id: creator._id, name: creator.name, role: creator.role },
    });

    res.status(201).json({ message: 'Coupon created successfully', coupon: newCoupon });
  } catch (error) {
    res.status(500).json({ message: 'Error creating coupon', error: error.message });
  }
};

// Redeem a coupon (Users Only)
exports.redeemCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const user = req.user;

    const coupon = await couponRepository.findByCode(code);
    if (!coupon) return res.status(404).json({ message: 'Invalid coupon' });

    if (coupon.isRedeemed) return res.status(400).json({ message: 'Coupon already used' });

    if (new Date() > coupon.expiresAt) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }

    // Mark as used
    coupon.isRedeemed = true;
    coupon.redeemedBy = { userId: user._id, redeemedAt: new Date() };
    await coupon.save();

    res.status(200).json({
      message: 'Coupon redeemed successfully',
      creator: coupon.creator,
      discount: coupon.discount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error redeeming coupon', error: error.message });
  }
};

// Get all coupons
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await couponRepository.findAll();
    res.status(200).json({ message: 'Coupons retrieved successfully', coupons });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving coupons', error: error.message });
  }
};

// Get coupon by code
exports.getCouponByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const coupon = await couponRepository.findByCode(code);
    if (!coupon) return res.status(404).json({ message: 'Invalid coupon' });

    res.status(200).json({ message: 'Coupon retrieved successfully', coupon });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving coupon', error: error.message });
  }
};
