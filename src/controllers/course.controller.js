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
    const { body, files } = req;
    const parsedBody = qs.parse(body);

    const mainPhotoUrl = files?.mainPhoto?.[0]?.path || null;

    const videoUrl = files.videoUrl
      ? await uploadToVimeo(files.videoUrl[0].path, files.videoUrl[0].originalname)
      : null;

    const courseData = { ...parsedBody, mainPhoto: mainPhotoUrl, testVideoUrl: videoUrl };

    const course = await courseRepo.createCourse(courseData);

    res.status(201).json({ message: 'Course created successfully', course: course });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createUnit = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { name, description, price, duration } = req.body;
    // check courseId is exist
    const course = await courseRepo.findCourseById(courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });

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

exports.updateCourse = async (req, res) => {
  try {
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

    if (!course) return res.status(404).json({ error: 'Course not found' });

    res.status(200).json({ message: 'Course updated successfully', course });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

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
