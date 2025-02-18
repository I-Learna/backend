const mongoose = require('mongoose');

const instructorRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    bio: { type: String, default: '' },
    profileImage: { type: String, default: '' },
    socialLinks: {
      twitter: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      youtube: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

const InstructorRequest = mongoose.model('InstructorRequest', instructorRequestSchema);

module.exports = { InstructorRequest };
