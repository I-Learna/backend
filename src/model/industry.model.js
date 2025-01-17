const mongoose = require('mongoose');
const { trim } = require('validator');

const industrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: function (value) {
        return /^[a-zA-Z\s-]+$/.test(value); // Only allows letters (uppercase or lowercase)
      },
      message: 'Name must contain only letters',
    },
  },
  description: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Industry', industrySchema);
