const { Course } = require('../models/recordedCourse.model');
const { Unit } = require('../models/unit.model');
const { Session } = require('../models/session.model');
const {
  calculatePriceAfterDiscount,
  calculateTotalDuration,
  calculateTotalPrice,
} = require('../../utils/calculateUtils');

exports.createSession = async (sessionData) => {
  const newSession = new Session(sessionData);
  await newSession.save();

  const unit = await Unit.findById(sessionData.unitId);
  if (unit) {
    unit.sessions.push(newSession._id);
    unit.duration = await Session.findSessionsByUnitId(unit._id).then((sessions) =>
      calculateTotalDuration(sessions)
    );
    unit.price = calculatePriceAfterDiscount(unit.price, unit.discount);
    await unit.save();

    const course = await Course.findById(unit.courseId);
    if (course) {
      course.totalSessions += 1;
      course.totalDuration += newSession.duration;
      course.price = calculateTotalPrice(course.units);
      await course.save();
    }
  }
  return newSession;
};

exports.findAllSessions = async () => {
  return Session.find().populate('unitId', 'name description').select('-__v ');
};

exports.findSessionsByUnitId = async (unitId) => {
  return Session.find({ unitId }).populate('unitId', 'name duration').select('-__v ');
};

exports.findSessionById = async (sessionId) => {
  return Session.findById(sessionId).populate('unitId', 'name description').select('-__v ');
};

exports.updateSession = async (id, updateData) => {
  const session = await Session.findById(id);
  if (!session) {
    throw new Error('Session not found');
  }

  const updatedSession = await Session.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  const unit = await Unit.findById(session.unitId);
  if (unit) {
    if (updateData.duration) {
      unit.duration = await Session.findSessionsByUnitId(unit._id).then((sessions) =>
        calculateTotalDuration(sessions)
      );
    }

    if (unit.discount) {
      unit.price = calculatePriceAfterDiscount(unit.price, unit.discount);
    }

    await unit.save();

    const course = await Course.findById(unit.courseId);
    if (course) {
      course.totalDuration = await Unit.findUnitsByCourseId(course._id).then((units) =>
        calculateTotalDuration(units)
      );
      course.price = await Unit.findUnitsByCourseId(course._id).then((units) =>
        calculateTotalPrice(units)
      );

      await course.save();
    }
  }

  return updatedSession;
};

exports.deleteSession = async (id) => {
  return Session.findByIdAndDelete(id);
};
