const mongoose = require('mongoose');
const { Schema } = mongoose;
const slugMiddleware = require('../../shared/middleware/slugMiddleware');

// Course
const liveCourseSchema = new Schema(
  {
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
    discount: {
      type: {
        type: String,
        enum: ['amount', 'percentage', 'none'],
        default: 'none',
      },
      value: { type: Number, default: 0 },
    },
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
    testVideoUrl: { type: String },
    isApproved: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
    reviews: [{ type: Schema.Types.ObjectId, ref: 'Review', default: [] }],
    qna: [{ type: Schema.Types.ObjectId, ref: 'QA', default: [] }],
    totalReviews: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Apply slug middleware
slugMiddleware(liveCourseSchema, 'LiveCourse');

const Course = mongoose.model('LiveCourse', liveCourseSchema);

module.exports = { Course };
