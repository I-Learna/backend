const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  uploadUserFiles,
} = require('../controllers/user.controller');

router.route('/').get(getAllUsers);

router.route('/:id').get(getUserById).patch(uploadUserFiles, updateUser).delete(deleteUser);

module.exports = router;
