const mongoose = require('mongoose');
const { trim } = require('validator');
const { formatArabicName, formatEnglishName } = require('../utils/slugifyName');

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
    name_ar: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate: {
        validator: function (value) {
          return /^[\u0621-\u064A\s-]+$/.test(value); // Only allows Arabic letters and spaces
        },
        message: 'Name in Arabic must contain only Arabic letters',
      },
    },
    slugName: {
      type: String,
      unique: true,
      trim: true,
    },
    slugName_ar: {
      type: String,
      unique: true,
      trim: true,
    },
    description: { type: String },
  },
  { timestamps: true }
);


industrySchema.query.excludeFields = function () {
  return this.select('-createdAt -updatedAt -__v');
};

industrySchema.query.includeFields = function () {
  return this.select('-createdAt -updatedAt -__v');
};

// Pre-save middleware to create slugs
industrySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slugName = formatEnglishName(this.name);
  }
  if (this.isModified('name_ar')) {
    // Custom slugify logic to preserve Arabic characters
    this.slugName_ar = formatArabicName(this.name_ar)
  }
  next();
});

module.exports = mongoose.model('Industry', industrySchema);
