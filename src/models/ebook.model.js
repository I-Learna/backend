const mongoose = require('mongoose');

const EbookSchema = new mongoose.Schema({
  industry: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Industry', required: true }],
  sector: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sector', required: true }],
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  mainPhoto: { type: String, required: true },
  language: { type: [String], enum: ['english', 'arabic'], required: true },
  translated: { type: String, enum: ['english', 'arabic', 'N/A'], default: 'N/A' },
  video: { type: String },
  doc: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  discount: {
    type: {
      type: String,
      enum: ['amount', 'percentage', 'none'],
      default: 'none',
    },
    value: { type: Number, default: 0 },
  },
  createdAt: { type: Date, default: Date.now },
});

// Virtual field for final price calculation
EbookSchema.virtual('finalPrice').get(function () {
  if (this.discount.type === 'amount') {
    return Math.max(this.price - this.discount.value, 0);
  }
  if (this.discount.type === 'percentage') {
    return Math.max(this.price - (this.price * this.discount.value) / 100, 0);
  }
  return this.price;
});

EbookSchema.set('toJSON', { virtuals: true });
EbookSchema.set('toObject', { virtuals: true });

const Ebook = mongoose.model('Ebook', EbookSchema);
module.exports = Ebook;
