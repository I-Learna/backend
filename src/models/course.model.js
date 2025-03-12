const mongoose = require('mongoose');
const { Schema } = mongoose;

// Course
const CourseSchema = new Schema({
  industry: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Industry', required: true }],
  sector: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sector', required: true }],
  name: { type: String, required: true },
  description: { type: String, required: true },
  mainPhoto: { type: String, required: true },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'all'], required: true },
  language: { type: String, enum: ['english', 'arabic'], required: true },
  subtitle: { type: String, enum: ['english', 'arabic'], required: true },
  whatYouLearn: [{ type: String }],
  requirements: [{ type: String }],
  units: [{ type: Schema.Types.ObjectId, ref: 'Unit', default: [] }],
  totalDuration: { type: Number, default: 0 },
  totalSessions: { type: Number, default: 0 },
  totalUnits: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  discount: { type: Boolean, default: false },
  coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
  testVideoUrl: { type: String, required: true },
  isApproved: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: false },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  reviews: [{ type: Schema.Types.ObjectId, ref: 'Review', default: [] }],
  qna: [{ type: Schema.Types.ObjectId, ref: 'QA', default: [] }],
});

// Unit
const UnitSchema = new Schema({
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  duration: { type: Number, required: true },
  sessions: [{ type: Schema.Types.ObjectId, ref: 'Session', default: [] }],
  rating: { type: Number, min: 1, max: 5, default: 0 },
});

// Session
const SessionSchema = new Schema({
  unitId: { type: Schema.Types.ObjectId, ref: 'Unit', required: true },
  name: { type: String, required: true },
  duration: { type: Number, required: true },
  videoUrl: { type: String, required: true },
  freePreview: { type: Boolean, default: false },
  documents: [{ type: String, default: [] }],
});

// Review
const ReviewSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  refId: { type: Schema.Types.ObjectId, required: true },
  refType: { type: String, enum: ['course'], required: true },
  review: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, default: 1 },
  createdAt: { type: Date, default: Date.now },
});

// QA
const QASchema = new Schema({
  refId: { type: Schema.Types.ObjectId, required: true },
  refType: { type: String, enum: ['course'], required: true },
  question: { type: String, required: true },
  askedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [
    {
      answer: { type: String, required: true },
      answeredBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const Course = mongoose.model('Course', CourseSchema);
const Unit = mongoose.model('Unit', UnitSchema);
const Session = mongoose.model('Session', SessionSchema);
const Review = mongoose.model('Review', ReviewSchema);
const QA = mongoose.model('QA', QASchema);

module.exports = { Course, Unit, Session, Review, QA };
