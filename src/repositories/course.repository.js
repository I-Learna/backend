const { Course, Unit, Session, Review, QA } = require('../models/course.model');

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
exports.findUnitsByCourseId = async (courseId) => {
  return Unit.find({ courseId })
    .populate('courseId', 'name description')
    .populate('sessions', 'name duration videoUrl freePreview')
    .select('-__v -createdAt -updatedAt');
};

exports.findSessionsByUnitId = async (unitId) => {
  return Session.find({ unitId })
    .populate('unitId', 'name duration')
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

exports.publishCourse = async (id) => {
  return Course.findByIdAndUpdate(id, { isPublished: true })
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

exports.createReview = async (reviewData) => {
  const newReview = new Review(reviewData);
  await newReview.save();
  return newReview;
};

exports.getReviews = async (refId, refType) => {
  return Review.find({ refId, refType })
    .populate('userId', 'name role profileImage createdAt')
    .select('-__v -createdAt -updatedAt');
};

exports.createQuestion = async (questionData) => {
  const newQuestion = new QA(questionData);
  await newQuestion.save();
  return newQuestion.populate('askedBy', 'name role profileImage createdAt');
};

exports.addAnswer = async (qaId, answerData) => {
  return QA.findByIdAndUpdate(qaId, { $push: { answers: answerData } }, { new: true })
    .populate('answers.answeredBy', 'name role profileImage createdAt')
    .select('-__v -createdAt -updatedAt');
};

exports.getQuestions = async (refId, refType) => {
  return QA.find({ refId, refType })
    .populate('askedBy', 'name role profileImage createdAt')
    .populate('answers.answeredBy', 'name role profileImage createdAt')
    .select('-__v -createdAt -updatedAt');
};
