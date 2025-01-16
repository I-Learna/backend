const mongoose = require('mongoose');
const moment = require('moment');

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    discount: { type: Number, required: true }, 
    creator: { 
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
        role: { type: String, required: true }
    },
    type: { type: String, enum: ['limited', 'short'], required: true }, // 'limited' = 1 month,  'short' = 3 days
    expiresAt: { type: Date, required: true },
    isRedeemed: { type: Boolean, default: false },
    redeemedBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        redeemedAt: { type: Date }
    }
});

// auto set expiration date based on coupuon type
couponSchema.pre('save', function (next) {
    if (this.type === 'limited') {
        this.expiresAt = moment().add(1, 'month').toDate();
    } else {
        this.expiresAt = moment().add(3, 'days').toDate();
    }
    next();
});

const Coupon = mongoose.model('Coupon', couponSchema);
module.exports = Coupon;
