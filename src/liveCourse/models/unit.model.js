const mongoose = require('mongoose');
const { Schema } = mongoose;

// Unit
const liveUnitSchema = new Schema({
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  discount: {
    type: {
      type: String,
      enum: ['amount', 'percentage', 'none'],
      default: 'none',
    },
    value: { type: Number, default: 0 },
  },
  duration: { type: Number, required: true },
  sessions: [{ type: Schema.Types.ObjectId, ref: 'Session', default: [] }],
  rating: { type: Number, min: 1, max: 5, default: 0 },
});

// virtual field for final price calc
liveUnitSchema.virtual('finalPrice').get(function () {
  if (this.discount.type === 'amount') {
    return Math.max(this.price - this.discount.value, 0);
  }
  if (this.discount.type === 'percentage') {
    return Math.max(this.price - (this.price * this.discount.value) / 100, 0);
  }
  return this.price;
});

liveUnitSchema.set('toJSON', { virtuals: true });
liveUnitSchema.set('toObject', { virtuals: true });

const Unit = mongoose.model('LiveUnit', liveUnitSchema);

module.exports = { Unit };
