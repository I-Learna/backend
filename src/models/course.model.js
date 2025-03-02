const mongoose = require('mongoose');
const { Schema } = mongoose;

// Course
const CourseSchema = new Schema({
  industry: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Industry', required: true }],
  sector: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sector', required: true }],
  name: { type: String, required: true },
  description: { type: String, required: true },
  mainPhoto: { type: String, required: true },
  levels: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'all'], required: true },
  language: { type: String, enum: ['english', 'arabic'], required: true },
  subtitle: { type: String, enum: ['english', 'arabic'], required: true },
  whatYouLearn: [{ type: String }],
  requirements: [{ type: String }],
  units: [{ type: Schema.Types.ObjectId, ref: 'Unit' }],
  totalDuration: { type: Number, default: 0 },
  totalSessions: { type: Number, default: 0 },
  totalUnits: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  discount: { type: Boolean, default: false },
  coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
  testVideoUrl: { type: String, required: true },
});

// Unit
const UnitSchema = new Schema({
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  duration: { type: Number, required: true },
  sessions: [{ type: Schema.Types.ObjectId, ref: 'Session' }],
});

// Session
const SessionSchema = new Schema({
  unitId: { type: Schema.Types.ObjectId, ref: 'Unit', required: true },
  name: { type: String, required: true },
  duration: { type: Number, required: true },
  videoUrl: { type: String, required: true },
  freePreview: { type: Boolean, default: false },
  documents: [{ type: String }],
});

const Course = mongoose.model('Course', CourseSchema);
const Unit = mongoose.model('Unit', UnitSchema);
const Session = mongoose.model('Session', SessionSchema);

module.exports = { Course, Unit, Session };
