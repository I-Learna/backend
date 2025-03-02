const { Course, Unit, Session } = require('../models/course.model');

exports.createCourse = async (courseData) => {
  const newCourse = new Course(courseData);
  await newCourse.save();
  return newCourse;
};

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

exports.createSession = async (sessionData) => {
  const newSession = new Session(sessionData);
  await newSession.save();

  const unit = await Unit.findById(sessionData.unitId);
  if (unit) {
    unit.sessions.push(newSession._id);
    await unit.save();

    const course = await Course.findById(unit.courseId);
    if (course) {
      course.totalSessions += 1;
      course.totalDuration += newSession.duration;
      await course.save();
    }
  }

  return newSession;
};

exports.findAllCourses = async () => {
  return Course.find()
    .populate('industry', 'name name_ar options')
    .populate('sector', 'name description')
    .populate('coupon', 'name')
    .populate({
      path: 'units',
      select: '-__v -createdAt -updatedAt',
      populate: { path: 'sessions', select: '-__v -createdAt -updatedAt' },
    })
    .select('-__v -createdAt -updatedAt');
};
exports.findAllUnits = async (courseId) => {
  return Unit.find({ courseId })
    .populate('courseId', 'name description')
    .populate('sessions', 'name duration videoUrl freePreview')
    .select('-__v -createdAt -updatedAt');
};

exports.findAllSessions = async () => {
  return Session.find().populate('unitId', 'name description').select('-__v -createdAt -updatedAt');
};

exports.findCourseById = async (id) => {
  return Course.findById(id)
    .populate('industry', 'name name_ar options')
    .populate('sector', 'name description')
    .populate('coupon', 'name')
    .populate({
      path: 'units',
      populate: { path: 'sessions', select: '-__v -createdAt -updatedAt' },
      select: '-__v -createdAt -updatedAt',
    })
    .select('-__v -createdAt -updatedAt');
};

exports.findUnitById = async (unitId) => {
  return Unit.findById(unitId)
    .populate('courseId', 'name description')
    .populate('sessions', 'name duration videoUrl freePreview')
    .select('-__v -createdAt -updatedAt');
};

exports.findSessionById = async (sessionId) => {
  return Session.findById(sessionId)
    .populate('unitId', 'name description')
    .select('-__v -createdAt -updatedAt');
};

exports.updateCourse = async (id, updateData) => {
  return Course.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate('industry', 'name name_ar options')
    .populate('sector', 'name description')
    .populate('coupon', 'name')
    .populate({
      path: 'units',
      populate: { path: 'sessions', select: '-__v -createdAt -updatedAt' },
    });
};

exports.updateUnit = async (id, updateData) => {
  return Unit.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
    .populate('courseId', 'name description')
    .populate('sessions', 'name duration videoUrl freePreview')
    .select('-__v -createdAt -updatedAt');
};

exports.updateSession = async (id, updateData) => {
  return Session.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
    .populate('unitId', 'name description')
    .select('-__v -createdAt -updatedAt');
};

exports.delete = async (id) => {
  return Course.findByIdAndDelete(id);
};

exports.deleteUnit = async (id) => {
  return Unit.findByIdAndDelete(id);
};

exports.deleteSession = async (id) => {
  return Session.findByIdAndDelete(id);
};

exports.approveCourse = async (id) => {
  return Course.findByIdAndUpdate(id, { isApproved: true })
    .populate('industry', 'name name_ar options')
    .populate('sector', 'name description')
    .populate('coupon', 'name')
    .populate({
      path: 'units',
      populate: { path: 'sessions', select: '-__v -createdAt -updatedAt' },
      select: '-__v -createdAt -updatedAt',
    })
    .select('-__v -createdAt -updatedAt');
};
