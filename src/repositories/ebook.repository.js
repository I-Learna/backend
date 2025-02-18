const Ebook = require('../models/ebook.model');

exports.create = async (data) => {
  return await Ebook.create(data);
};

exports.findAll = async () => {
  const ebooks = await Ebook.find()
    .populate('industry', 'name name_ar options')
    .populate('sector', 'name description')
    .lean()
    .exec();
  if (!ebooks.length) return [];

  return ebooks.map((ebook) => ({
    ...ebook,
    finalPrice: Ebook.hydrate(ebook).finalPrice,
  }));
};

exports.findById = async (id) => {
  const ebook = await Ebook.findById(id)
    .populate('industry', 'name name_ar options')
    .populate('sector', 'name description')
    .lean()
    .exec();
  if (!ebook) return null;

  return { ...ebook, finalPrice: Ebook.hydrate(ebook).finalPrice };
};
exports.update = async (id, data) => {
  const ebook = await Ebook.findByIdAndUpdate(id, data, { new: true })
    .populate('industry', 'name name_ar options')
    .populate('sector', 'name description')
    .lean()
    .exec();
  if (!ebook) return null;

  return { ...ebook, finalPrice: Ebook.hydrate(ebook).finalPrice };
};

exports.delete = async (id) => {
  return await Ebook.findByIdAndDelete(id);
};
