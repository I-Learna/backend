const qs = require('qs');
const courseRepo = require('../repositories/course.repository');
const industryRepo = require('../repositories/industry.repository');
const sectorRepo = require('../repositories/sector.repository');

const { uploadMultiple, uploadToVimeo } = require('../utils/uploadUtil');
const catchAsync = require('../middlewares/catchAsync');
const AppErr = require('../middlewares/appErr');

// Middleware for file uploads
exports.uploadCourseFiles = uploadMultiple([
  { name: 'mainPhoto', maxCount: 1 },
  { name: 'videoUrl', maxCount: 1 },
  { name: 'documents', maxCount: 10 },
]);

exports.createCourse = catchAsync(async (req, res, next) => {

  const { body, files } = req;
  const parsedBody = qs.parse(body);
  // check if req.body.industry is exist in industry model
  const industry = await industryRepo.findIndustryIdsIsExist(parsedBody.industry);
  console.log(industry);
  if (industry.length === 0) return next(new AppErr('Industry is not found', 404));

  // check if req.body.sector is exist in sector model
  const sector = await sectorRepo.findSectorIdsIsExist(parsedBody.sector);
  console.log(sector);
  if (sector.length === 0) return next(new AppErr('Sector is not found', 404));

  const mainPhotoUrl = files?.mainPhoto?.[0]?.path || null;

  const videoUrl = files.videoUrl
    ? await uploadToVimeo(files.videoUrl[0].path, files.videoUrl[0].originalname)
    : null;

  const courseData = { ...parsedBody, mainPhoto: mainPhotoUrl, testVideoUrl: videoUrl };

  const course = await courseRepo.createCourse(courseData);

  res.status(201).json({ message: 'Course created successfully', course: course });

});

exports.createUnit = catchAsync(async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { name, description, price, duration } = req.body;
    // check courseId is exist
    const course = await courseRepo.findCourseById(courseId);
    if (!course) return next(new AppErr('Course not found', 404));
    if (!course.isApproved) return next(new AppErr('Course is not approved', 403));
    const unitData = {
      courseId,
      name,
      description,
      price: parseFloat(price),
      duration: parseFloat(duration),
    };
    const unit = await courseRepo.createUnit(unitData);

    res.status(201).json({ message: 'Unit created successfully', unit: unit });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

exports.createSession = catchAsync(async (req, res, next) => {

  const { unitId } = req.params;
  const { name, duration, freePreview } = req.body;
  const { files } = req;

  // check if unitId is exist
  const unit = await courseRepo.findUnitById(unitId);
  if (!unit) return next(new AppErr('Unit not found', 404));

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

});

exports.getAllCourses = catchAsync(async (req, res, next) => {
  const courses = await courseRepo.findAllCourses();
  if (!courses) return next(new AppErr('Courses not found', 404));
  res.status(200).json({ status: 'Success', length: courses.length, courses });

});
exports.getAllUnits = catchAsync(async (req, res, next) => {
  // check courseId is exist
  const { courseId } = req.params;
  const course = await courseRepo.findCourseById(courseId);
  if (!course) return next(new AppErr('Course not found', 404));
  const units = await courseRepo.findAllUnits(courseId);
  res.status(200).json({ status: 'Success', length: units.length, units });
});
exports.getAllSessions = catchAsync(async (req, res, next) => {
  // check if unitId is exist
  const { unitId } = req.params;
  const unit = await courseRepo.findUnitById(unitId);
  if (!unit) return next(new AppErr('Unit not found', 404));

  const sessions = await courseRepo.findAllSessions(unitId);
  if (sessions.length === 0) return next(new AppErr('Sessions not found', 404));
  res.status(200).json({ status: 'Success', length: sessions.length, sessions });

});

exports.getCourseById = catchAsync(async (req, res, next) => {
  const course = await courseRepo.findCourseById(req.params.id);
  if (!course) return next(new AppErr('Course not found', 404));
  res.status(200).json(course);

});
exports.getUnitById = catchAsync(async (req, res, next) => {
  const course = await courseRepo.findUnitById(req.params.id);
  if (!course) return next(new AppErr('Course not found', 404));
  res.status(200).json(course);
});
exports.getSessionById = catchAsync(async (req, res, next) => {
  const course = await courseRepo.findSessionById(req.params.id);
  if (!course) return next(new AppErr('Course not found', 404));
  res.status(200).json(course);
});

exports.updateCourse = catchAsync(async (req, res, next) => {

  const { body, files } = req;
  const { id } = req.params;

  const parsedBody = qs.parse(body);

  const mainPhotoUrl = files?.mainPhoto?.[0]?.path || parsedBody.mainPhoto || null;
  const videoUrl = files?.videoUrl?.[0]
    ? await uploadToVimeo(files.videoUrl[0].path, files.videoUrl[0].originalname)
    : parsedBody.videoUrl || null;
  const documents = files?.documents?.length ? files.documents.map((file) => file.path) : [];

  const units =
    parsedBody.units?.map((unit) => ({
      ...unit,
      price: parseFloat(unit.price),
      duration: parseFloat(unit.duration),
      sessions:
        unit.sessions?.map((session) => ({
          ...session,
          duration: parseFloat(session.duration),
          freePreview: session.freePreview === 'true',
          videoUrl,
          documents,
        })) || [],
    })) || [];

  const updateData = {
    ...parsedBody,
    mainPhoto: mainPhotoUrl,
    videoUrl,
    documents,
    units,
  };

  // Update course in database
  const course = await courseRepo.updateCourse(id, updateData);

  if (!course) return next(new AppErr('Course not found', 404));

  res.status(200).json({ message: 'Course updated successfully', course });

});

exports.updateUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, duration } = req.body;

    const unit = await courseRepo.findUnitById(id);
    if (!unit) return res.status(404).json({ error: 'Unit not found' });

    const updatedUnit = await courseRepo.updateUnit(id, {
      name,
      description,
      price: parseFloat(price),
      duration: parseFloat(duration),
    });

    const course = await courseRepo.findCourseById(unit.courseId);
    if (course) {
      course.totalDuration = course.units.reduce((sum, u) => sum + (u.duration || 0), 0);
      course.price = course.units.reduce((sum, u) => sum + (u.price || 0), 0);
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

    let videoUrl = session.videoUrl;
    if (files?.videoUrl) {
      videoUrl = await uploadToVimeo(files.videoUrl[0].path, files.videoUrl[0].originalname);
    }

    let documents = [...session.documents];
    if (files?.documents) {
      documents = [...documents, ...files.documents.map((file) => file.path)];
    }

    const updatedSession = await courseRepo.updateSession(id, {
      name,
      duration: parseFloat(duration),
      freePreview: freePreview === 'true',
      videoUrl,
      documents,
    });

    const unit = await courseRepo.findUnitById(session.unitId);
    if (unit) {
      const course = await courseRepo.findCourseById(unit.courseId);
      if (course) {
        course.totalDuration = course.units.reduce(
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

exports.approveCourse = catchAsync(async (req, res, next) => {
  // check courseId is exist
  const { courseId } = req.params;
  const existingCourse = await courseRepo.findCourseById(courseId);
  if (!existingCourse) return next(new AppErr('Course not found', 404));

  const course = await courseRepo.approveCourse(req.params.courseId);
  res.status(200).json({ success: true, message: 'Course approved successfully' });

});

exports.publishCourse = catchAsync(async (req, res, next) => {
  // check courseId is exist
  const { courseId } = req.params;
  const existingCourse = await courseRepo.findCourseById(courseId);
  if (!existingCourse) return next(new AppErr('Course not found', 404));

  const course = await courseRepo.publishCourse(req.params.courseId);
  res.status(200).json({ success: true, message: 'Course Published successfully' });

});

exports.createReview = async (req, res) => {
  try {
    const { refId, refType, review, rating } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!refId || !refType || !review || !rating) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const reviewData = {
      userId: req.user._id,
      refId,
      refType,
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
    const { refId, refType } = req.params;

    if (!refId || !refType) {
      return res.status(400).json({ error: 'refId and refType are required' });
    }

    const reviews = await courseRepo.getReviews(refId, refType);

    res.status(200).json({ status: 'success', total: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createQuestion = async (req, res) => {
  try {
    const { refId, refType, question } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!refId || !refType || !question) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const questionData = {
      refId,
      refType,
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

    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!answer) {
      return res.status(400).json({ error: 'Answer is required' });
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
    const { refId, refType } = req.params;

    if (!refId || !refType) {
      return res.status(400).json({ error: 'refId and refType are required' });
    }

    const questions = await courseRepo.getQuestions(refId, refType);

    res.status(200).json({ status: 'success', total: questions.length, questions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
