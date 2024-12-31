const mongoose = require('mongoose');

const sectorSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  industryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Industry', required: true },
  description: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('sector', sectorSchema);
