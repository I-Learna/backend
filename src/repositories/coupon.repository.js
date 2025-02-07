const Coupon = require('../model/coupon.model');

exports.create = async (couponData) => {
  const newCoupon = new Coupon(couponData);
  return newCoupon.save();
};

exports.findByCode = async (code) => {
  return Coupon.findOne({ code }).populate('creator', 'name role');
};

exports.findAll = async () => {
  return Coupon.find().populate('creator', 'name role');
};

exports.update = async (id, updateData) => {
  return Coupon.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};
