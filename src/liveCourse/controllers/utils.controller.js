const courseRepo = require('../repositories/liveCourse.repository');

exports.createReview = async (req, res) => {
  try {
    const { course, review, rating } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!course || !review || !rating) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const existingCourse = await courseRepo.findCourseById(course);
    if (!existingCourse || !existingCourse.isPublished) {
      return res.status(404).json({ error: 'Course not found or not published' });
    }

    const reviewData = {
      user: req.user._id,
      course,
      review,
      rating,
    };

    const newReview = await courseRepo.createReview(reviewData);

    res.status(201).json({ message: 'Review added successfully', review: newReview });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const { course } = req.params;

    if (!course) {
      return res.status(400).json({ error: 'Course Id is required' });
    }

    const existingCourse = await courseRepo.findCourseById(course);

    if (!existingCourse || !existingCourse.isPublished) {
      return res.status(404).json({ error: 'Course not found or not published' });
    }

    const reviews = await courseRepo.getReviews(course);
    const totalReviews = reviews.length;

    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    reviews.forEach((review) => {
      const roundedRating = Math.round(review.rating);
      if (ratingCounts[roundedRating] !== undefined) {
        ratingCounts[roundedRating] += 1;
      }
    });

    const ratingPercentages = {};
    Object.keys(ratingCounts).forEach((rating) => {
      ratingPercentages[rating] =
        totalReviews > 0 ? Math.round((ratingCounts[rating] / totalReviews) * 100) + '%' : '0%';
    });

    res.status(200).json({
      status: 'success',
      totalReviews,
      ratingCounts,
      ratingPercentages,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createQuestion = async (req, res) => {
  try {
    const { course, question } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!course || !question) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const existingCourse = await courseRepo.findCourseById(course);

    if (!existingCourse || !existingCourse.isPublished) {
      return res.status(404).json({ error: 'Course not found or not published' });
    }
    const questionData = {
      course,
      question,
      askedBy: req.user._id,
    };

    const newQuestion = await courseRepo.createQuestion(questionData);

    res.status(201).json({ message: 'Question added successfully', question: newQuestion });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addAnswer = async (req, res) => {
  try {
    const { qaId } = req.params;
    const { answer } = req.body;

    if (!req.user || !req.user._id || req.user.role !== 'Freelancer') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!answer) {
      return res.status(400).json({ error: 'Answer is required' });
    }
    if (!qaId) {
      return res.status(400).json({ error: 'qaId is required' });
    }
    const existingQA = await courseRepo.findQAById(qaId);
    if (!existingQA) {
      return res.status(404).json({ error: 'QA not found' });
    }

    const answerData = {
      answer,
      answeredBy: req.user._id,
    };
    if (req.user.role !== 'Freelancer') {
      return res.status(403).json({ error: 'Only Instructors can add answers' });
    }
    const updatedQA = await courseRepo.addAnswer(qaId, answerData);

    res.status(200).json({ message: 'Answer added successfully', updatedQA });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getQuestions = async (req, res) => {
  try {
    const { course } = req.params;

    if (!course) {
      return res.status(400).json({ error: 'Course Id are required' });
    }

    const existingCourse = await courseRepo.findCourseById(course);

    if (!existingCourse || !existingCourse.isPublished) {
      return res.status(404).json({ error: 'Course not found or not published' });
    }

    const questions = await courseRepo.getQuestions(course);

    res.status(200).json({ status: 'success', total: questions.length, questions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getAllInstructorLiveEnrollRequests = async (req, res) => {
  try {
    const instructorLiveEnrollRequests = await courseRepo.getAllInstructorLiveEnrollRequests();
    res.status(200).json({
      status: 'success',
      total: instructorLiveEnrollRequests.length,
      instructorLiveEnrollRequests,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.enrollInstructor = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { wage, schedule } = req.body;
    const userId = req.user.id;

    const result = await courseRepo.requestInstructorEnrollment(userId, courseId, wage, schedule);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.handleInstructorApproval = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, course } = req.body;

    if (!['approve', 'reject'].includes(status)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const result = await courseRepo.approveOrRejectInstructor(requestId, course, status);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
