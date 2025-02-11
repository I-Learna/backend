const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [3, 'Name must be at least 3 characters long'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
      validate: {
        validator: (value) => /^[a-zA-Z\s]+$/.test(value),
        message: 'Name must contain only letters and spaces',
      },
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: validator.isEmail,
        message: 'Invalid email format',
      },
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    provider: {
      type: String,
      enum: ['local', 'google', 'linkedin'],
      default: 'local',
    },
    providerId: { type: String, default: null },
    role: {
      type: String,
      enum: ['User', 'Admin', 'OperationTeam', 'PaymentTeam', 'Freelancer'],
      default: 'User',
    },
    isEmailVerified: { type: Boolean, default: false },
    verificationCode: { type: String, select: false },
    verificationCodeExpires: { type: Date, select: false },
    resetPasswordToken: { type: String, select: false, default: null },
    resetPasswordExpires: { type: Date, select: false, default: null },
    refreshToken: { type: String, select: false, default: null },

    // Instructor fields
    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio must be under 500 characters'],
      default: '',
    },
    profileImage: {
      type: String,
      default: '',
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
    socialLinks: {
      website: {
        type: String,
        validate: {
          validator: function (value) {
            return !value || /^https?:\/\/.+/.test(value);
          },
          message: 'Website must be a valid URL',
        },
      },
      twitter: {
        type: String,
        validate: {
          validator: function (value) {
            return !value || /^https?:\/\/(www\.)?twitter\.com\/[A-Za-z0-9_]+/.test(value);
          },
          message: 'Invalid Twitter URL',
        },
      },
      linkedin: {
        type: String,
        validate: {
          validator: function (value) {
            return !value || /^https?:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+/.test(value);
          },
          message: 'Invalid LinkedIn URL',
        },
      },
      youtube: {
        type: String,
        validate: {
          validator: function (value) {
            return (
              !value ||
              /^https?:\/\/(www\.)?youtube\.com\/(channel|c|user)\/[A-Za-z0-9_-]+/.test(value)
            );
          },
          message: 'Invalid YouTube URL',
        },
      },
    },
  },
  { timestamps: true }
);

// Virtual field for confirmPassword
userSchema
  .virtual('confirmPassword')
  .get(function () {
    return this._confirmPassword;
  })
  .set(function (value) {
    this._confirmPassword = value;
  });

// Validate password confirmation before saving
userSchema.pre('validate', function (next) {
  if (this.provider === 'local' && this.isModified('password')) {
    if (this._confirmPassword !== this.password) {
      this.invalidate('confirmPassword', 'Passwords do not match');
    }
  }
  next();
});

userSchema.pre('save', function (next) {
  if (this.isModified('role')) this.markModified('role');
  if (this.isModified('bio')) this.markModified('bio');
  if (this.isModified('profileImage')) this.markModified('profileImage');
  if (this.isModified('socialLinks')) this.markModified('socialLinks');
  next();
});

// Hash password before saving (Only for local signups)
userSchema.pre('save', async function (next) {
  if (this.provider !== 'local' || !this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  this._confirmPassword = undefined; // Ensure confirmPassword is not stored
  next();
});

// Compare password (Only for local signups)
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Set refresh token
userSchema.methods.setRefreshToken = function (refreshToken) {
  this.refreshToken = refreshToken;
  return this.save();
};

// Clear refresh token
userSchema.methods.clearRefreshToken = async function () {
  this.refreshToken = null;
  await this.save();
};

const User = mongoose.model('User', userSchema);
module.exports = User;
