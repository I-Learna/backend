const { Course } = require('../models/liveCourse.model');
const { Unit } = require('../models/unit.model');
const { calculatePriceAfterDiscount } = require('../../utils/calculateUtils');

exports.createUnit = async (unitData) => {
  const newUnit = new Unit(unitData);
  await newUnit.save();

  const priceAfterDiscount = calculatePriceAfterDiscount(newUnit.price, newUnit.discount);
  const course = await Course.findById(unitData.courseId);
  if (course) {
    course.units.push(newUnit._id);
    course.totalUnits += 1;
    course.price += newUnit.price;
    course.priceAfterDiscount += priceAfterDiscount;
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
  const unit = await Unit.findById(id);
  if (!unit) {
    throw new Error('Unit not found');
  }
  const oldPriceAfterDiscount = calculatePriceAfterDiscount(unit.price, unit.discount);
  const updatedUnit = await Unit.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate('courseId', 'name description')
    .populate('sessions', 'name duration videoUrl freePreview')
    .select('-__v ');

  const newPriceAfterDiscount = calculatePriceAfterDiscount(
    updatedUnit.price,
    updatedUnit.discount
  );

  if (oldPriceAfterDiscount !== newPriceAfterDiscount) {
    const course = await Course.findById(updatedUnit.courseId);
    if (course) {
      course.price = Math.max(0, course.price - oldPriceAfterDiscount + newPriceAfterDiscount);
      await course.save();
    }
  }
  return updatedUnit;
};

exports.deleteUnit = async (id) => {
  return Unit.findByIdAndDelete(id);
};
