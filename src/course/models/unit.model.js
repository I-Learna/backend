const mongoose = require('mongoose');
const { Schema } = mongoose;

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

const Unit = mongoose.model('Unit', UnitSchema);

module.exports = { Unit };
