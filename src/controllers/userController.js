const User = require('../model/user.model');

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password -refreshToken -__v -createdAt -updatedAt');
    res.status(200).json({ Status: 'Success', 'Total Users': users.length, data: users });
  } catch (error) {
    return next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      '-password -refreshToken -__v -createdAt -updatedAt'
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ Status: 'Success', data: user });
  } catch (error) {
    return next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    let updates = req.body;

    // Blockin pass update
    if (updates.password) {
      return res.status(400).json({ message: 'Use password reset feature to update password' });
    }

    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    return next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    return next(error);
  }
};
