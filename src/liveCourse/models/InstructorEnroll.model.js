const mongoose = require('mongoose');

const instructorLiveEnrollRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    wage: { type: Number, required: true }, // wage per hour
    schedule: [
      {
        date: { type: Date, required: true },
        timeSlots: [{ type: String, required: true }],
      },
    ],
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'LiveCourse', required: true },
  },
  { timestamps: true }
);

const InstructorLiveEnrollRequest = mongoose.model(
  'InstructorLiveEnrollRequest',
  instructorLiveEnrollRequestSchema
);

module.exports = { InstructorLiveEnrollRequest };
