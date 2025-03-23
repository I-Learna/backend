const { Schema } = require('mongoose');

module.exports.ReviewSchema = new Schema(
  {
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    review: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, default: 0 },
  },
  { timestamps: true }
);
