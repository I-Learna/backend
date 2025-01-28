const AppErr = require('../middlewares/appErr');
const catchAsync = require('../middlewares/catchAsync');
const User = require('../model/user.model');
const sendEmail = require('../services/email');
const emailTemplate = require('../services/emailHtml');

const generateAuthCode = require('../utils/generateAuthCode');
const generateToken = require('../utils/generateToken');
const jwt = require('jsonwebtoken');

// Registration
const registerUser = catchAsync(async (req, res, next) => {
    const { name, email, password, confirmPassword } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return next(new AppErr('Email already exists', 409));

    const user = await User.create({ name, email, password });

    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token in the DB
    user.setRefreshToken(refreshToken);

    res.cookie('accessToken', accessToken, { httpOnly: true, secure: true });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });

    res.status(201).json({ _id: user._id, name: user.name, email: user.email });
});

// Login
const loginUser = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return next(new AppErr('Invalid email or password', 401));

    if (await user.comparePassword(password)) {
        const accessToken = generateToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Store refresh token in the DB
        user.setRefreshToken(refreshToken);

        res.cookie('accessToken', accessToken, { httpOnly: true, secure: true });
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });

        res.status(200).json({ _id: user._id, name: user.name, email: user.email, token: accessToken });
    } else {
        return next(new AppErr('Invalid email or password', 401));
    }
});

// Google Authentication Callback
const googleAuth = catchAsync(async (req, res, next) => {
    const { id, name, email, accessToken, refreshToken } = req.user;

    let user = await User.findOne({ email });
    if (!user) {
        user = await User.create({ name, email, password: id });
    }

    await user.setRefreshToken(refreshToken);

    res.cookie('accessToken', accessToken, { httpOnly: true, secure: true });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });

    res.redirect('/api/dashboard');
});

// LinkedIn Authentication Callback
const linkedInAuth = catchAsync(async (req, res, next) => {
    const { id, name, email, accessToken, refreshToken } = req.user;

    let user = await User.findOne({ email });
    if (!user) {
        user = await User.create({ name, email, password: id });
    }

    await user.setRefreshToken(refreshToken);

    res.cookie('accessToken', accessToken, { httpOnly: true, secure: true });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });

    res.redirect('/api/dashboard');
});

// Reset Password
const resetPassword = catchAsync(async (req, res, next) => {
    const { resetToken, newPassword } = req.body;

    const user = await User.findOne({
        resetPasswordToken: resetToken,
        resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return next(new AppErr('Invalid or expired reset token', 400));

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Password has been successfully reset' });
});

// Role Assignment
const assignRole = catchAsync(async (req, res, next) => {
    const { userId, role } = req.body;
    const validRoles = ['User', 'Admin', 'OperationTeam', 'PaymentTeam'];

    if (!validRoles.includes(role)) return next(new AppErr('Invalid role', 400));

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true, runValidators: true });
    if (!user) return next(new AppErr('User not found', 404));

    res.status(200).json({
        message: `Role updated to ${role} for user ${user.name}`,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
});

// Logout
const logoutUser = (req, res) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = {
    registerUser,
    loginUser,
    googleAuth,
    linkedInAuth,
    assignRole,
    resetPassword,
    logoutUser,
};
