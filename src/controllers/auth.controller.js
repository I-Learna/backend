const AppErr = require('../middlewares/appErr');
const catchAsync = require('../middlewares/catchAsync');
const User = require('../model/user.model');
const { InstructorRequest } = require('../model/instructor.model');
const sendEmail = require('../services/email');
const emailTemplate = require('../services/emailHtml');
const generateToken = require('../utils/generateToken');
const { formatName, capitalizeWords } = require('../utils/slugifyName');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Registration
const registerUser = catchAsync(async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) return next(new AppErr('Email already exists', 409));

  const formattedName = capitalizeWords(formatName(name));
  const verificationToken = generateToken.generateAccessToken(email);
  await User.create({
    name: formattedName,
    email,
    password,
    confirmPassword,
    isEmailVerified: false,
    bio: '',
    profileImage: '',
    socialLinks: {
      twitter: '',
      linkedin: '',
      youtube: '',
    },
  });

  const activationUrl = `${process.env.CLIENT_URL}/api/auth/activate/${verificationToken}`;
  await sendEmail({ email, template: emailTemplate(activationUrl) });
  console.log(activationUrl);

  res
    .status(201)
    .json({ message: 'Registration successful. Please check your email for activation.' });
});

// Activate User
const activateUser = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  if (!token) return next(new AppErr('Invalid activation link', 400));

  const decoded = generateToken.verifyToken(token);
  if (!decoded || !decoded.id) {
    return next(new AppErr('Invalid or expired token', 400));
  }

  // Find the user by decoded email
  const user = await User.findOne({ email: decoded.id });
  if (!user) return next(new AppErr('User not found', 404));

  if (user.isEmailVerified) return res.status(400).json({ message: 'User is already active' });

  await User.findOneAndUpdate(
    { email: decoded.id },
    { isEmailVerified: true },
    { new: true, runValidators: true }
  );
  res.status(200).json({ message: 'Account activated. You can now log in.' });
});

// Refresh Access Token
const refreshToken = catchAsync(async (req, res, next) => {
  const refreshTokenFromCookie = req.cookies.refreshToken;

  if (!refreshTokenFromCookie) {
    return next(new AppErr('Refresh token required', 403));
  }

  try {
    const user = await User.findOne({ refreshToken: refreshTokenFromCookie });
    if (!user) {
      throw new Error('Invalid refresh token');
    }

    // Verifying the refresh token
    const decoded = generateToken.verifyToken(refreshTokenFromCookie);
    if (!decoded) {
      return next(new AppErr('Invalid refresh token', 403));
    }

    // Generating new tokens
    const newAccessToken = generateToken.generateAccessToken(user._id);
    const newRefreshToken = generateToken.generateRefreshToken(user._id);

    // Updating the user model with the new refresh token
    await user.setRefreshToken(newRefreshToken);

    // Sending the new tokens as cookies
    res.cookie('accessToken', newAccessToken, { httpOnly: true, secure: true });
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
    });

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return next(new AppErr(error.message, 403));
  }
});

// Login
const loginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) return next(new AppErr('Invalid email or password', 401));

  if (!user.isEmailVerified) {
    return next(new AppErr('Please verify your email', 401));
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return next(new AppErr('Invalid email or password', 401));

  const accessToken = generateToken.generateAccessToken(user._id);
  const refreshToken = generateToken.generateRefreshToken(user._id);

  // Store refresh token in the DB
  await user.setRefreshToken(refreshToken);

  // Sending tokens via cookies
  res.cookie('accessToken', accessToken, { httpOnly: true, secure: true });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
  });

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    token: accessToken,
    refreshToken,
  });
});

// Google Authentication Callback
const googleAuth = catchAsync(async (req, res, next) => {
  try {
    const { id, name, email, accessToken, refreshToken } = req.user;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name, email, password: id });
    }

    await user.setRefreshToken(refreshToken);

    res.cookie('accessToken', accessToken, { httpOnly: true, secure: true });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
    });

    res.redirect('/api/industry');
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
});

// LinkedIn Authentication Callback
const linkedInAuth = catchAsync(async (req, res, next) => {
  try {
    const { id, name, email, accessToken, refreshToken } = req.user;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name, email, password: id });
    }

    await user.setRefreshToken(refreshToken);

    res.cookie('accessToken', accessToken, { httpOnly: true, secure: true });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
    });

    res.redirect('/api/industry');
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
});

// Forgot Password
const forgotPassword = catchAsync(async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next(new AppErr('User not found', 404));

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15min
    await user.save({ validateBeforeSave: false });

    // Email
    const resetURL = `${process.env.CLIENT_URL}/api/auth/reset-password/${resetToken}`;
    await sendEmail({
      email: user.email,
      subject: 'Password reset request',
      message: `You requested a password reset. Click the link below to reset your password: \n\n${resetURL}\n\nThis link is valid for 15 minutes.`,
      template: emailTemplate(resetURL),
    });
    console.log(resetURL);

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// Reset Password
const resetPassword = catchAsync(async (req, res, next) => {
  const { newPassword, confirmPassword } = req.body;
  const { resetToken } = req.params;

  try {
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    user.password = newPassword;
    user.confirmPassword = confirmPassword;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// Change Password (Authenticated User)
const changePassword = catchAsync(async (req, res, next) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    user.confirmPassword = confirmPassword;
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect old password' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (err) {
    return next(err);
  }
});

// Request to be Instructor
const requestInstructor = catchAsync(async (req, res, next) => {
  try {
    const { userId, bio, profileImage, socialLinks } = req.body;

    const user = await User.findById(userId).select('-__v -createdAt -updatedAt');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const existingRequest = await InstructorRequest.findOne({ userId });
    if (existingRequest) {
      return res.status(400).json({ message: 'You already requested to become an instructor' });
    }

    const newRequest = await InstructorRequest.create({
      userId,
      bio: bio || '',
      profileImage: profileImage || '',
      socialLinks: {
        twitter: socialLinks?.twitter || '',
        linkedin: socialLinks?.linkedin || '',
        youtube: socialLinks?.youtube || '',
      },
      status: 'pending',
    });

    res.status(200).json({
      message: 'Your instructor request has been submitted for approval.',
      request: newRequest,
      user,
    });
  } catch (error) {
    next(error);
  }
});

// Admin Approves or Rejects Request
const reviewInstructorRequest = catchAsync(async (req, res, next) => {
  try {
    const { requestId, action } = req.body;

    const request = await InstructorRequest.findById(requestId).populate('userId');
    if (!request) return res.status(404).json({ message: 'Request not found' });

    const user = request.userId;
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (action === 'approve') {
      user.role = 'Freelancer';
      user.bio = request.bio;
      user.profileImage = request.profileImage;
      user.socialLinks = request.socialLinks;

      await user.save();
      await InstructorRequest.findByIdAndDelete(requestId);

      await sendEmail({
        email: user.email,
        subject: 'Instructor Request Approved',
        message: 'Congratulations! You are now an instructor.',
      });

      res.status(200).json({ message: 'User is now an instructor.', user });
    } else if (action === 'reject') {
      await InstructorRequest.findByIdAndDelete(requestId);

      await sendEmail({
        email: user.email,
        subject: 'Instructor Request Rejected',
        message: 'Your instructor request has been rejected.',
      });

      res.status(200).json({ message: 'Instructor request rejected.' });
    } else {
      return res.status(400).json({ message: 'Invalid action. Use approve or reject.' });
    }
  } catch (error) {
    next(error);
  }
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

// Activate or Inactivate user
const updateUserStatus = catchAsync(async (req, res, next) => {
  const { userId, isEmailVerified } = req.body;

  if (!userId || typeof isEmailVerified !== 'boolean') {
    return next(new AppErr('Invalid request data', 400));
  }

  const user = await User.findById(userId);
  if (!user) return next(new AppErr('User not found', 404));

  user.isEmailVerified = isEmailVerified;
  await user.save();

  res
    .status(200)
    .json({ message: `User status updated to ${isEmailVerified ? 'Active' : 'Inactive'}` });
});

// Logout
const logoutUser = catchAsync(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  const user = await User.findOne({ refreshToken });
  if (!user) return next(new AppErr('User not found', 404));

  await user.clearRefreshToken();

  // maxAge is the maximum age of the cookie in milliseconds. we set it to 1 effectively deletes the cookie.
  res.cookie('accessToken', '', { maxAge: 1 });
  res.cookie('refreshToken', '', { maxAge: 1 });

  res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = {
  registerUser,
  loginUser,
  updateUserStatus,
  refreshToken,
  activateUser,
  googleAuth,
  linkedInAuth,
  assignRole,
  changePassword,
  forgotPassword,
  resetPassword,
  requestInstructor,
  reviewInstructorRequest,
  logoutUser,
};
