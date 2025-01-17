const Coupon = require('../model/coupon.model');
const User = require('../model/user.model');

// creating new coupon (Admin Only)
const createCoupon = async (req, res) => {
    try {
        const { code, discount, type } = req.body;
        const creator = req.user; 

        if (creator.role !== 'Admin') {
            return res.status(403).json({ message: 'Only admins can create coupons' });
        }

        const newCoupon = new Coupon({
            code,
            discount,
            type,
            creator: {
                _id: creator._id,
                name: creator.name,
                role: creator.role
            }
        });

        await newCoupon.save();
        res.status(201).json({ message: 'Coupon created successfully', coupon: newCoupon });

    } catch (error) {
        res.status(500).json({ message: 'Error creating coupon', error: error.message });
    }
};

// Redeeming Coupon (Users Only)
const redeemCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        const user = req.user;

        const coupon = await Coupon.findOne({ code });
        if (!coupon) return res.status(404).json({ message: 'Invalid coupon' });

        if (coupon.isRedeemed) return res.status(400).json({ message: 'Coupon already used' });

        if (new Date() > coupon.expiresAt) {
            return res.status(400).json({ message: 'Coupon has expired' });
        }

        // mark as used
        coupon.isRedeemed = true;
        coupon.redeemedBy = { userId: user._id, redeemedAt: new Date() };
        await coupon.save();

        res.status(200).json({
            message: 'Coupon redeemed successfully',
            creator: coupon.creator, 
            discount: coupon.discount
        });

    } catch (error) {
        res.status(500).json({ message: 'Error redeeming coupon', error: error.message });
    }
};

module.exports = { createCoupon, redeemCoupon };
