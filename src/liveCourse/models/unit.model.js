const mongoose = require('mongoose');
const { Schema } = mongoose;

// Unit
const liveUnitSchema = new Schema({
  courseId: { type: Schema.Types.ObjectId, ref: 'LiveCourse', required: true },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  duration: { type: Number, required: true },
  sessions: [{ type: Schema.Types.ObjectId, ref: 'LiveSession', default: [] }],
  rating: { type: Number, min: 1, max: 5, default: 0 },
});

liveUnitSchema.set('toJSON', { virtuals: true });
liveUnitSchema.set('toObject', { virtuals: true });

const Unit = mongoose.model('LiveUnit', liveUnitSchema);

module.exports = { Unit };
