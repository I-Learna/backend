const { Course, Unit, Session } = require('../models/course.model');

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

exports.findAllSessions = async () => {
  return Session.find().populate('unitId', 'name description').select('-__v ');
};

exports.findSessionsByUnitId = async (unitId) => {
  return Session.find({ unitId })
    .populate('unitId', 'name duration')
    .select('-__v ');
};

exports.findSessionById = async (sessionId) => {
  return Session.findById(sessionId)
    .populate('unitId', 'name description')
    .select('-__v ');
};

exports.updateSession = async (id, updateData) => {
  return Session.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
    .populate('unitId', 'name description')
    .select('-__v ');
};

exports.deleteSession = async (id) => {
  return Session.findByIdAndDelete(id);
};
