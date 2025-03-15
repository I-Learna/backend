const { Course, Review, QA } = require('../models/course.model');

exports.createCourse = async (courseData) => {
  const newCourse = new Course(courseData);
  await newCourse.save();
  return newCourse;
};

exports.findAllCourses = async (filter = {}) => {
  return Course.find(filter)
    .populate('user', 'name profileImage ')
    .populate('industry', 'name ')
    .populate('sector', 'name ')
    .populate('coupon', 'name')
    .select('-__v -createdAt ');
};

exports.findCourseById = async (id) => {
  return Course.findById(id)
    .populate('user', 'name profileImage ')
    .populate('industry', 'name ')
    .populate('sector', 'name ')
    .populate({
      path: 'qna',
      populate: [
        { path: 'course', select: 'name mainPhoto level language price' },
        { path: 'askedBy', select: 'name role profileImage' },
        { path: 'answers.answeredBy', select: 'name role profileImage' },
      ],
      select: 'question answers',
    })
    .populate({
      path: 'reviews',
      populate: { path: 'user', select: 'name profileImage' },
      select: 'review rating createdAt',
    })
    .populate('coupon', 'name')
    .populate({
      path: 'units',
      populate: { path: 'sessions', select: '-__v -createdAt -updatedAt' },
      select: '-__v -createdAt -updatedAt',
    })
    .select('-__v -createdAt ');
};

exports.updateCourse = async (id, updateData) => {
  return Course.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate('user', 'name profileImage ')
    .populate('industry', 'name ')
    .populate('sector', 'name')
    .populate('coupon', 'name')
    .populate({
      path: 'units',
      populate: { path: 'sessions', select: '-__v -createdAt -updatedAt' },
    });
};

exports.deleteCourse = async (id) => {
  return Course.findByIdAndDelete(id);
};

exports.approveCourse = async (id) => {
  return Course.findByIdAndUpdate(id, { isApproved: true })
    .populate('user', 'name profileImage ')
    .populate('industry', 'name ')
    .populate('sector', 'name ')
    .populate('coupon', 'name')
    .populate({
      path: 'units',
      populate: { path: 'sessions', select: '-__v -createdAt -updatedAt' },
      select: '-__v -createdAt -updatedAt',
    })
    .select('-__v -createdAt ');
};

exports.publishCourse = async (id) => {
  return Course.findByIdAndUpdate(id, { isPublished: true })
    .populate('user', 'name  profileImage ')
    .populate('industry', 'name ')
    .populate('sector', 'name ')
    .populate('coupon', 'name')
    .populate({
      path: 'units',
      populate: { path: 'sessions', select: '-__v -createdAt -updatedAt' },
      select: '-__v -createdAt ',
    })
    .select('-__v -createdAt ');
};

exports.createReview = async (reviewData) => {
  const newReview = new Review(reviewData);
  await newReview.save();
  await Course.findByIdAndUpdate(reviewData.course, { $push: { reviews: newReview._id } });
  return newReview;
};

exports.getReviews = async (course) => {
  return Review.find({ course }).populate('user', 'name  profileImage').select('-__v ');
};

exports.createQuestion = async (questionData) => {
  const newQuestion = new QA(questionData);
  await newQuestion.save();
  await Course.findByIdAndUpdate(questionData.course, { $push: { qna: newQuestion._id } });
  return newQuestion.populate('askedBy', 'name  profileImage');
};

exports.addAnswer = async (qaId, answerData) => {
  return QA.findByIdAndUpdate(qaId, { $push: { answers: answerData } }, { new: true })
    .populate('answers.answeredBy', 'name role profileImage')
    .select('-__v ');
};

exports.getQuestions = async (course) => {
  return QA.find({ course })
    .populate('course', 'name mainPhoto level language price')
    .populate('askedBy', 'name profileImage ')
    .populate('answers.answeredBy', 'name role profileImage')
    .select('-__v ');
};

exports.findQAById = async (id) => {
  return QA.findById(id)
    .populate('course', 'name mainPhoto level language price')
    .populate('askedBy', 'name profileImage ')
    .populate('answers.answeredBy', 'name role profileImage')
    .select('-__v ');
};
