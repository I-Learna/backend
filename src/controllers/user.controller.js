const userRepository = require('../repositories/user.repository');

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await userRepository.findAllUsers();
    res.status(200).json({ Status: 'Success', totalUsers: users.length, data: users });
  } catch (error) {
    return next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await userRepository.findUserById(req.params.id);
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
    const updates = req.body;

    if (updates.password) {
      return res.status(400).json({ message: 'Use password reset feature to update password' });
    }

    const user = await userRepository.updateUserById(id, updates);
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
    const user = await userRepository.deleteUserById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    return next(error);
  }
};
