const mongoose = require('mongoose');
const { Schema } = mongoose;

// Session
const SessionSchema = new Schema({
  unitId: { type: Schema.Types.ObjectId, ref: 'RecordedUnit', required: true },
  name: { type: String, required: true },
  duration: { type: Number, required: true },
  videoUrl: { type: String, required: true },
  freePreview: { type: Boolean, default: false },
  documents: [{ type: String, default: [] }],
});

const Session = mongoose.model('RecordedSession', SessionSchema);

module.exports = { Session };
