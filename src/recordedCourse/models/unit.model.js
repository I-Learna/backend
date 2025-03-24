const mongoose = require('mongoose');
const { Schema } = mongoose;

// Unit
const UnitSchema = new Schema({
  courseId: { type: Schema.Types.ObjectId, ref: 'RecordedCourse', required: true },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  duration: { type: Number, required: true },
  sessions: [{ type: Schema.Types.ObjectId, ref: 'RecordedSession', default: [] }],
  rating: { type: Number, min: 1, max: 5, default: 0 },
});

UnitSchema.set('toJSON', { virtuals: true });
UnitSchema.set('toObject', { virtuals: true });

const Unit = mongoose.model('RecordedUnit', UnitSchema);

module.exports = { Unit };
