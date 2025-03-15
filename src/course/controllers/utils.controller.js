const courseRepo = require('../repositories/course.repository');

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

    if (!existingCourse) {
      return res.status(404).json({ error: 'Course not found' });
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
      return res.status(400).json({ error: 'refId and refType are required' });
    }

    const reviews = await courseRepo.getReviews(course);

    res.status(200).json({ status: 'success', total: reviews.length, reviews });
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
    if (!existingCourse) {
      return res.status(404).json({ error: 'Course not found' });
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
      return res.status(400).json({ error: 'refId and refType are required' });
    }

    const existingCourse = await courseRepo.findCourseById(course);

    if (!existingCourse) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const questions = await courseRepo.getQuestions(course);

    res.status(200).json({ status: 'success', total: questions.length, questions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
