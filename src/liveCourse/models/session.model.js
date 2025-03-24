const mongoose = require('mongoose');
const { Schema } = mongoose;

// Session
const liveSessionSchema = new Schema({
  unitId: { type: Schema.Types.ObjectId, ref: 'LiveUnit', required: true },
  name: { type: String, required: true },
  duration: { type: Number, required: true },
  videoUrl: { type: String },
  freePreview: { type: Boolean, default: false },
  documents: [{ type: String, default: [] }],
});

const Session = mongoose.model('LiveSession', liveSessionSchema);

module.exports = { Session };
