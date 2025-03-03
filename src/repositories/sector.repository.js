const Sector = require('../models/sector.model');

const getAll = async () => {
  return await Sector.find().excludeFields();
};

const getById = async (id) => {
  return await Sector.findById(id).includeFields();
};

const create = async (data) => {
  const sector = new Sector(data);
  return await sector.save();
};

const updateById = async (id, updateData) => {
  return await Sector.findByIdAndUpdate(id, updateData, { new: true });
};

const deleteById = async (id) => {
  return await Sector.findByIdAndDelete(id);
};

const findBySlugInDiffrentId = async (slugName, slugName_ar = null, id = null) => {
  const query = {
    $or: [{ slugName }, ...(slugName_ar ? [{ slugName_ar }] : [])],
  };

  if (id) {
    query._id = { $ne: id }; // استبعاد السجل الحالي باستخدام ID
  }

  return await Sector.findOne(query);
};

const findBySlug = async (slugName, slugName_ar) => {
  const query = {
    $or: [
      { slugName }, // Matches if slugName exists
      { slugName_ar }, // Matches if slugName_ar exists
    ],
  };
  return await Sector.findOne(query);
};

const findExact = async (id, name) => {
  return await Sector.findOne({ _id: id, slugName: name });
};

const findSectorIdsIsExist = async (ids) => {
  return await Sector.find({ _id: { $in: ids } });
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
  findSectorIdsIsExist
};
