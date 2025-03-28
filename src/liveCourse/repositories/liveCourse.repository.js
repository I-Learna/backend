const { Course } = require('../models/liveCourse.model');
const { InstructorLiveEnrollRequest } = require('../models//InstructorEnroll.model');
const { QA } = require('../../shared/models/qa.schema');
const { Review } = require('../../shared/models/review.schema');

exports.createCourse = async (courseData) => {
  const newCourse = new Course(courseData);
  await newCourse.save();
  return newCourse;
};

exports.findAllCourses = async (filter = {}) => {
  return (
    Course.find(filter)
      .populate('user', 'name profileImage ')
      .populate('industry', 'name ')
      .populate('sector', 'name ')
      // .populate('coupon', 'name')
      .select(
        '-__v -subtitle -whatYouLearn -requirements -units -testVideoUrl -isApproved -isPublished -reviews -qna -slug'
      )
  );
};

// industry , sector  , createdBy name , createdby_profile image  , createdby bio ,   course name , course description ,   course main photo ,  last update of course , level , language ,  total hours of units , total number of sessions  , price , discount , priceAfterDiscount ,  total numbers of reviews , average of rate  , whatYouLearn ,  requirements  , units , and sessions
exports.findCourseById = async (id) => {
  return (
    Course.findById(id, { isPublished: true })
      .populate('user', 'name profileImage bio')
      .select('instructors')
      .populate('instructors.user', 'name profileImage bio')
      .populate('industry', 'name ')
      .populate('sector', 'name ')
      // .populate('coupon', 'name')
      .populate({
        path: 'units',
        populate: { path: 'sessions', select: '-__v' },
        select: '-__v ',
      })
      .select('-__v -subtitle  -reviews -qna -slug')
  );
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
      populate: { path: 'sessions', select: '-__v ' },
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
      populate: { path: 'sessions', select: '-__v ' },
      select: '-__v ',
    })
    .select('-__v  ');
};

// industry , sector  , createdBy name , createdby_profile image ,   course name , course description ,   course main photo ,  last update of course , level , language ,  total hours of units , total number of sessions  , price , discount , priceAfterDiscount ,  total numbers of reviews , average of rate
exports.publishCourse = async (id) => {
  return Course.findByIdAndUpdate(id, { isPublished: true })
    .select('createdAt updatedAt ')
    .populate('user', 'name  profileImage ')
    .populate('industry', 'name ')
    .populate('sector', 'name ')
    .populate('coupon', 'name')
    .select(
      '-__v -subtitle -whatYouLearn -requirements -units -testVideoUrl -isApproved -isPublished -reviews -qna -slug'
    );
};

exports.createReview = async (reviewData) => {
  const newReview = new Review(reviewData);
  await newReview.save();

  const course = await Course.findById(reviewData.course);
  if (course) {
    const reviews = await Review.find({ course: reviewData.course });
    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews;

    await Course.findByIdAndUpdate(reviewData.course, {
      totalReviews,
      averageRating,
      $push: { reviews: newReview._id },
    });
  }

  return newReview;
};

// total reviews , average rate ,   percentage of 5 star review . percentage of 4 star reviews   , percentage of 3 stars , percentage of 2 starts , percentage of 1 stars,     reviews [  {    createdby , created date ,  rate ,  description }       ]
exports.getReviews = async (course) => {
  return Review.find({ course })
    .populate('user', 'name  profileImage')
    .populate('course', 'totalReviews averageRating')
    .select('-__v ');
};

exports.createQuestion = async (questionData) => {
  const newQuestion = new QA(questionData);
  await newQuestion.save();
  await Course.findByIdAndUpdate(questionData.course, { $push: { qna: newQuestion._id } });
  return newQuestion.populate('askedBy', 'name profileImage');
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

exports.getAllInstructorsForCourse = async (courseId) => {
  return Course.findById(courseId).populate('user', 'name role profileImage').select('user');
};

exports.getAllInstructorLiveEnrollRequests = async () => {
  return InstructorLiveEnrollRequest.find()
    .populate('user', 'name role profileImage')
    .populate('course', 'name description')
    .select('-__v -createdAt -updatedAt');
};

exports.requestInstructorEnrollment = async (userId, courseId, wage, schedule) => {
  try {
    const existingRequest = await InstructorLiveEnrollRequest.findOne({
      user: userId,
      course: courseId,
    });

    if (existingRequest) {
      throw new Error('Enrollment request already submitted for this course.');
    }

    const enrollRequest = new InstructorLiveEnrollRequest({
      user: userId,
      course: courseId,
      wage,
      schedule,
    });
    await enrollRequest.save();
    return { message: 'Enrollment request submitted successfully' };
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.approveOrRejectInstructor = async (requestId, courseId, status) => {
  try {
    const request = await InstructorLiveEnrollRequest.findOne({ _id: requestId, course: courseId });
    if (!request) throw new Error('Enrollment request not found');

    if (status === 'approve') {
      await Course.findByIdAndUpdate(courseId, {
        $push: {
          instructors: { user: request.user, wage: request.wage, schedule: request.schedule },
        },
      });

      await InstructorLiveEnrollRequest.findByIdAndDelete(requestId);
      return { message: 'Instructor approved and added to the course' };
    } else {
      await InstructorLiveEnrollRequest.findByIdAndDelete(requestId);
      return { message: 'Instructor enrollment request rejected' };
    }
  } catch (error) {
    throw new Error(error.message);
  }
};
