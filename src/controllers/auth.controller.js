const AppErr = require('../middlewares/appErr');
const catchAsync = require('../middlewares/catchAsync');
const User = require('../model/user.model');
const sendEmail = require('../services/email');
const emailTemplate = require('../services/emailHtml');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const { formatName, capitalizeWords } = require('../utils/slugifyName');


// Registration
const registerUser = catchAsync(async (req, res, next) => {
    const { name, email, password, confirmPassword } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return next(new AppErr('Email already exists', 409));

    const formattedName = capitalizeWords(formatName(name));

    const user = await User.create({ name: formattedName, email, password, confirmPassword });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token in the DB
    user.setRefreshToken(refreshToken);

    res.cookie('accessToken', accessToken, { httpOnly: true, secure: true });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });

    res.status(201).json({ _id: user._id, name: user.name, email: user.email });

    await sendEmail({ email: req.body.email, template: emailTemplate(`${user._id}`) });
});

// Login
const loginUser = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return next(new AppErr('Invalid email or password', 401));

    if (await user.comparePassword(password)) {
        const accessToken = generateToken(user._id);
        const refreshToken = generateToken.generateRefreshToken(user._id);

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

// Forgot Password
const forgotPassword = catchAsync(async (req, res, next) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next(new AppErr('User not found', 404));

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15min
    await user.save({ validateBeforeSave: false });

    // email
    const resetURL = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;
    await sendEmail({
        email: user.email,
        subject: 'Password reset request',
        message: `You requested a pass reset. Click the link below to reset your password: \n\n${resetURL}\n\nThis link is valid for 15 minutes.`,
    });

    res.status(200).json({ message: 'Password reset email sent' });
});

// Reset Password
const resetPassword = catchAsync(async (req, res, next) => {
    const { resetToken, newPassword, confirmPassword } = req.body;

    // Hash token and check user
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const user = await User.findOne({ resetPasswordToken: hashedToken, resetPasswordExpires: { $gt: Date.now() } });

    if (!user) return next(new AppErr('Invalid or expired reset token', 400));
    if (newPassword !== confirmPassword) return next(new AppErr('Passwords do not match', 400));

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
});

// Change Password (Authenticated User)
const changePassword = catchAsync(async (req, res, next) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return next(new AppErr('User not found', 404));
    if (!(await bcrypt.compare(oldPassword, user.password))) return next(new AppErr('Incorrect old password', 401));
    if (newPassword !== confirmPassword) return next(new AppErr('Passwords do not match', 400));

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
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
    changePassword,
    forgotPassword,
    resetPassword,
    logoutUser,
};
