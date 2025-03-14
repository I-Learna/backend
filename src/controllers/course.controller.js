const qs = require('qs');
const courseRepo = require('../repositories/course.repository');
const { uploadMultiple, uploadToVimeo } = require('../utils/uploadUtil');

// Middleware for file uploads
exports.uploadCourseFiles = uploadMultiple([
  { name: 'mainPhoto', maxCount: 1 },
  { name: 'videoUrl', maxCount: 1 },
  { name: 'documents', maxCount: 10 },
]);

exports.createCourse = async (req, res) => {
  try {
    const user = req.user;

    const { body, files } = req;
    const parsedBody = qs.parse(body);

    const mainPhotoUrl = files?.mainPhoto?.[0]?.path || null;

    const videoUrl = files.videoUrl
      ? await uploadToVimeo(files.videoUrl[0].path, files.videoUrl[0].originalname)
      : null;

    const courseData = {
      ...parsedBody,
      mainPhoto: mainPhotoUrl,
      testVideoUrl: videoUrl,
      user: user,
    };

    const course = await courseRepo.createCourse(courseData);

    res.status(201).json({ message: 'Course created successfully', course: course });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createUnit = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { name, description, price, duration, rating } = req.body;
    // check courseId is exist
    const course = await courseRepo.findCourseById(courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    if (!course.isApproved) return res.status(403).json({ error: 'Course must be approved first' });
    const unitData = {
      courseId,
      name,
      description,
      price: parseFloat(price),
      duration: parseFloat(duration),
      rating,
    };
    const unit = await courseRepo.createUnit(unitData);

    res.status(201).json({ message: 'Unit created successfully', unit: unit });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createSession = async (req, res) => {
  try {
    const { unitId } = req.params;
    const { name, duration, freePreview } = req.body;
    const { files } = req;

    // check if unitId is exist
    const unit = await courseRepo.findUnitById(unitId);
    if (!unit) return res.status(404).json({ error: 'Unit not found' });

    const videoUrl = files.videoUrl
      ? await uploadToVimeo(files.videoUrl[0].path, files.videoUrl[0].originalname)
      : null;
    const documents = files.documents ? files.documents.map((file) => file.path) : [];

    const sessionData = {
      unitId,
      name,
      duration: parseFloat(duration),
      freePreview: freePreview === 'true',
      videoUrl,
      documents,
    };

    const session = await courseRepo.createSession(sessionData);

    res.status(201).json({ message: 'Session created successfully', session: session });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await courseRepo.findAllCourses();
    res.status(200).json({ status: 'Success', length: courses.length, courses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllUnits = async (req, res) => {
  try {
    // check courseId is exist
    const { courseId } = req.params;
    const course = await courseRepo.findCourseById(courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const courses = await courseRepo.findAllUnits(courseId);
    res.status(200).json({ status: 'Success', length: courses.length, courses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllSessions = async (req, res) => {
  try {
    const courses = await courseRepo.findAllSessions();
    res.status(200).json({ status: 'Success', length: courses.length, courses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await courseRepo.findCourseById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllCoursesByUserId = async (req, res) => {
  try {
    const courses = await courseRepo.findAllCourses({ user: req.params.userId });
    res.status(200).json({ status: 'Success', length: courses.length, courses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getPublishedCourses = async (req, res) => {
  try {
    const courses = await courseRepo.findAllCourses({ isPublished: true });
    res.status(200).json({ status: 'Success', length: courses.length, courses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUnitById = async (req, res) => {
  try {
    const course = await courseRepo.findUnitById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSessionById = async (req, res) => {
  try {
    const course = await courseRepo.findSessionById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.findUnitsByCourseId = async (req, res) => {
  try {
    const { courseId } = req.params;
    const units = await courseRepo.findUnitsByCourseId(courseId);
    if (!units || units.length === 0) {
      return res.status(404).json({ error: 'No units found for this course' });
    }
    res.status(200).json({ status: 'Success', total: units.length, units });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.findSessionsByUnitId = async (req, res) => {
  try {
    const { unitId } = req.params;
    const sessions = await courseRepo.findSessionsByUnitId(unitId);
    if (!sessions || sessions.length === 0) {
      return res.status(404).json({ error: 'No sessions found for this course' });
    }
    res.status(200).json({ status: 'Success', total: sessions.length, sessions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateCourse = async (req, res) => {
  const { body, files } = req;
  const { id } = req.params;
  const user = req.user;

  if (!user) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const existingCourse = await courseRepo.findCourseById(id);
    if (!existingCourse) return res.status(404).json({ error: 'Course not found' });

    const updateData = {};

    if (body.name) updateData.name = body.name;
    if (body.description) updateData.description = body.description;
    if (body.level) updateData.level = body.level;
    if (body.language) updateData.language = body.language;
    if (body.subtitle) updateData.subtitle = body.subtitle;
    if (body.whatYouLearn) updateData.whatYouLearn = JSON.parse(body.whatYouLearn);
    if (body.requirements) updateData.requirements = JSON.parse(body.requirements);
    if (body.totalDuration) updateData.totalDuration = parseFloat(body.totalDuration);
    if (body.totalSessions) updateData.totalSessions = parseInt(body.totalSessions, 10);
    if (body.totalUnits) updateData.totalUnits = parseInt(body.totalUnits, 10);
    if (body.price) updateData.price = parseFloat(body.price);
    if (body.rating) updateData.rating = parseFloat(body.rating);
    if (body.discount) updateData.discount = body.discount === 'true';
    if (body.isApproved) updateData.isApproved = body.isApproved === 'true';
    if (body.isPublished) updateData.isPublished = body.isPublished === 'true';

    if (files?.mainPhoto?.[0]?.path) updateData.mainPhoto = files.mainPhoto[0].path;
    if (files?.videoUrl?.[0]) {
      updateData.videoUrl = await uploadToVimeo(
        files.videoUrl[0].path,
        files.videoUrl[0].originalname
      );
    } else if (body.videoUrl) {
      updateData.videoUrl = body.videoUrl;
    }
    if (files?.documents?.length) updateData.documents = files.documents.map((file) => file.path);

    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const updatedCourse = await courseRepo.updateCourse(id, updateData);

    res.status(200).json({ message: 'Course updated successfully', course: updatedCourse });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.updateUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, duration, rating } = req.body;

    const unit = await courseRepo.findUnitById(id);
    if (!unit) return res.status(404).json({ error: 'Unit not found' });

    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (duration !== undefined) updateData.duration = parseFloat(duration);
    if (rating !== undefined) updateData.rating = parseFloat(rating);

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const updatedUnit = await courseRepo.updateUnit(id, updateData);

    const course = await courseRepo.findCourseById(unit.courseId);

    if (course) {
      const updatedUnits = await courseRepo.findUnitsByCourseId(course._id);

      if (updateData.duration !== undefined) {
        course.totalDuration = updatedUnits.reduce((sum, u) => sum + (u.duration || 0), 0);
      }
      if (updateData.price !== undefined) {
        course.price = updatedUnits.reduce((sum, u) => sum + (u.price || 0), 0);
      }
      await course.save();
    }

    res.status(200).json({ message: 'Unit updated successfully', unit: updatedUnit });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, duration, freePreview } = req.body;
    const { files } = req;

    const session = await courseRepo.findSessionById(id);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const updateData = {};

    if (name) updateData.name = name;
    if (duration !== undefined) updateData.duration = parseFloat(duration);
    if (freePreview !== undefined) updateData.freePreview = freePreview === 'true';

    if (files?.videoUrl?.[0]) {
      updateData.videoUrl = await uploadToVimeo(
        files.videoUrl[0].path,
        files.videoUrl[0].originalname
      );
    }

    if (files?.documents?.length) {
      updateData.documents = [...session.documents, ...files.documents.map((file) => file.path)];
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const updatedSession = await courseRepo.updateSession(id, updateData);

    const unit = await courseRepo.findUnitById(session.unitId);
    if (unit) {
      const course = await courseRepo.findCourseById(unit.courseId);
      if (course) {
        const updatedUnits = await courseRepo.findUnitsByCourseId(course._id);
        course.totalDuration = updatedUnits.reduce(
          (sum, u) => sum + u.sessions.reduce((sSum, s) => sSum + (s.duration || 0), 0),
          0
        );
        await course.save();
      }
    }

    res.status(200).json({ message: 'Session updated successfully', session: updatedSession });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const deletedCourse = await courseRepo.delete(req.params.id);
    if (!deletedCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const unit = await courseRepo.findUnitById(id);
    if (!unit) return res.status(404).json({ error: 'Unit not found' });

    await courseRepo.deleteUnit(id);

    const course = await courseRepo.findCourseById(unit.courseId);
    if (course) {
      course.units = course.units.filter((u) => u.toString() !== id);
      course.totalUnits -= 1;
      course.totalDuration -= unit.duration || 0;
      course.price -= unit.price || 0;
      await course.save();
    }

    res.status(200).json({ message: 'Unit deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteSession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await courseRepo.findSessionById(id);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    await courseRepo.deleteSession(id);

    const unit = await courseRepo.findUnitById(session.unitId);
    if (unit) {
      unit.sessions = unit.sessions.filter((s) => s.toString() !== id);
      await unit.save();

      const course = await courseRepo.findCourseById(unit.courseId);
      if (course) {
        course.totalSessions -= 1;
        course.totalDuration -= session.duration || 0;
        await course.save();
      }
    }

    res.status(200).json({ message: 'Session deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.approveCourse = async (req, res) => {
  try {
    const course = await courseRepo.approveCourse(req.params.courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.status(200).json({ success: true, message: 'Course approved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.publishCourse = async (req, res) => {
  try {
    const course = await courseRepo.findCourseById(req.params.courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    if (!course.isApproved) return res.status(403).json({ error: 'Course must be approved first' });
    const publishedCourse = await courseRepo.publishCourse(req.params.courseId);
    res
      .status(200)
      .json({ success: true, message: 'Course Published successfully', course: publishedCourse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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
