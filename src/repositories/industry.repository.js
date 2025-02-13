const Industry = require('../models/industry.model');

const getAll = async () => {
  return await Industry.find().excludeFields();
};

const getById = async (id) => {
  return await Industry.findById(id).includeFields();
};

const create = async (data) => {
  const industry = new Industry(data);
  return await industry.save();
};

const updateById = async (id, updateData) => {
  return await Industry.findByIdAndUpdate(id, updateData, { new: true });
};

const deleteById = async (id) => {
  return await Industry.findByIdAndDelete(id);
};

const findBySlugInDiffrentId = async (slugName, slugName_ar = null, id = null) => {
  const query = {
    $or: [{ slugName }, ...(slugName_ar ? [{ slugName_ar }] : [])],
  };

  if (id) {
    query._id = { $ne: id }; // استبعاد السجل الحالي باستخدام ID
  }

  return await Industry.findOne(query);
};

const findBySlug = async (slugName, slugName_ar) => {
  const query = {
    $or: [
      { slugName }, // Matches if slugName exists
      { slugName_ar }, // Matches if slugName_ar exists
    ],
  };
  return await Industry.findOne(query);
};

const findExact = async (id, name) => {
  return await Industry.findOne({ _id: id, slugName: name });
};

module.exports = {
  getAll,
  getById,
  create,
  updateById,
  deleteById,
  findBySlug,
  findExact,
  findBySlugInDiffrentId,
};
