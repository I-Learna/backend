const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');

    router.route('/')
        .get(getAllUsers)

    router.route('/:id')
        .get(getUserById)
        .patch(updateUser)
        .delete(deleteUser);


module.exports = router;
