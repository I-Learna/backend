const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const instructorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, 'Name must be at least 3 characters'],
      maxlength: [50, 'Name must be under 50 characters'],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
      index: true,
    },
    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false, // Don't return password in queries
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio must be under 500 characters'],
    },
    profileImage: {
      type: String,
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
    isAccepted: { type: Boolean, default: false, index: true },
    isEmailVerified: { type: Boolean, default: false },
    verificationCode: {
      type: String,
      length: [6, 'Verification code must be 6 characters'],
      select: false,
    },
    verificationCodeExpires: { type: Date },

    resetPasswordToken: { type: String, default: null, select: false },
    resetPasswordExpires: { type: Date, default: null, select: false },
    refreshToken: { type: String, default: null, select: false },
    role: { type: String, default: 'Freelancer' },
  },
  { timestamps: true }
);

// Hash password before saving (Only for local signups)
instructorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password (Only for local signups)
instructorSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Virtual Field for Profile URL
instructorSchema.virtual('fullProfileUrl').get(function () {
  return `${process.env.FRONT}/instructors/${this._id}`; //will add the front url
});

const instructorRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  },
  { timestamps: true }
);

const Instructor = mongoose.model('Instructor', instructorSchema);
const InstructorRequest = mongoose.model('InstructorRequest', instructorRequestSchema);

module.exports = { Instructor, InstructorRequest };
