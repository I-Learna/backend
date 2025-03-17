const mongoose = require('mongoose');
const { Schema } = mongoose;
const slugify = require('slugify');

// Course
const CourseSchema = new Schema({
  industry: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Industry', required: true }],
  sector: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sector', required: true }],
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  slug: { type: String, unique: true, lowercase: true, trim: true },
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
  reviews: [{ type: Schema.Types.ObjectId, ref: 'Review', default: [] }],
  qna: [{ type: Schema.Types.ObjectId, ref: 'QA', default: [] }],
});

// slug middleware before saving
CourseSchema.pre('save', async function (next) {
  if (!this.isModified('name')) return next(); // only update slug if name changes

  let baseSlug = slugify(this.name, { lower: true, strict: true });
  let uniqueSlug = baseSlug;
  let counter = 1;

  // checkin if slug already exists in the db
  while (await mongoose.model('Course').exists({ slug: uniqueSlug })) {
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  this.slug = uniqueSlug;
  next();
});

// Review
const ReviewSchema = new Schema({
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  review: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// QA
const QASchema = new Schema({
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
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
const Review = mongoose.model('Review', ReviewSchema);
const QA = mongoose.model('QA', QASchema);

module.exports = { Course, Review, QA };
