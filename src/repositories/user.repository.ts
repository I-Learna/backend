const User = require('../model/user.model');

const selectFields = '-password -refreshToken -__v -createdAt -updatedAt';

exports.findAllUsers = async () => {
  return User.find().select(selectFields);
};

exports.findUserById = async (id) => {
  return User.findById(id).select(selectFields);
};

exports.updateUserById = async (id, updates) => {
  return User.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).select(
    selectFields
  );
};

exports.deleteUserById = async (id) => {
  return User.findByIdAndDelete(id);
};
