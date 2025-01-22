const mongoose = require('mongoose');
const { trim } = require('validator');
const slugify = require('slugify'); // Use the slugify package for consistent slugs

const industrySchema = new mongoose.Schema(
  {
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
    slugName: {
      type: String,
      unique: true,
      trim: true,
    },
    description: { type: String },
  },
  { timestamps: true }
);

// Pre-save middleware to create slug
industrySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slugName = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model('Industry', industrySchema);
