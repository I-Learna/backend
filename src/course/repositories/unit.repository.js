const { Course, Unit } = require('../models/course.model');

exports.createUnit = async (unitData) => {
  const newUnit = new Unit(unitData);
  await newUnit.save();

  const course = await Course.findById(unitData.courseId);
  if (course) {
    course.units.push(newUnit._id);
    course.totalUnits += 1;
    course.price += newUnit.price;
    course.totalDuration += newUnit.duration;
    await course.save();
  }

  return newUnit;
};

exports.findAllUnits = async (courseId) => {
  return Unit.find({ courseId })
    .populate('courseId', 'name description')
    .populate('sessions', 'name duration videoUrl freePreview')
    .select('-__v ');
};

exports.findUnitsByCourseId = async (courseId) => {
  return Unit.find({ courseId })
    .populate('courseId', 'name description')
    .populate('sessions', 'name duration videoUrl freePreview')
    .select('-__v ');
};

exports.findUnitById = async (unitId) => {
  return Unit.findById(unitId)
    .populate('courseId', 'name description')
    .populate('sessions', 'name duration videoUrl freePreview')
    .select('-__v ');
};

exports.updateUnit = async (id, updateData) => {
  return Unit.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
    .populate('courseId', 'name description')
    .populate('sessions', 'name duration videoUrl freePreview')
    .select('-__v ');
};

exports.deleteUnit = async (id) => {
  return Unit.findByIdAndDelete(id);
};
