const qs = require('qs');
const courseRepo = require('../repositories/course.repository');
const { uploadMultiple, uploadToVimeo } = require('../utils/uploadUtil'); // Import utilities

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

    const mainPhotoUrl = files.mainPhoto && files.mainPhoto[0] ? files.mainPhoto[0].path : null;
    const videoUrl =
      files.videoUrl && files.videoUrl[0]
        ? await uploadToVimeo(files.videoUrl[0].path, files.videoUrl[0].originalname)
        : null;
    const documents =
      files.documents && files.documents?.length > 0
        ? files.documents?.map((file) => file.path)
        : [];

    const units = [];
    if (parsedBody.units && Array.isArray(parsedBody.units)) {
      for (let i = 0; i < parsedBody.units.length; i++) {
        const unit = {
          name: parsedBody.units[i].name,
          description: parsedBody.units[i].description,
          price: parseFloat(parsedBody.units[i].price),
          duration: parseFloat(parsedBody.units[i].duration),
          sessions: [],
        };

        if (parsedBody.units[i].sessions && Array.isArray(parsedBody.units[i].sessions)) {
          for (let j = 0; j < parsedBody.units[i].sessions.length; j++) {
            const session = {
              name: parsedBody.units[i].sessions[j].name,
              duration: parseFloat(parsedBody.units[i].sessions[j].duration),
              freePreview: parsedBody.units[i].sessions[j].freePreview === 'true',
              videoUrl: videoUrl,
              documents: documents,
            };
            unit.sessions.push(session);
          }
        }

        units.push(unit);
      }
    }

    const courseData = {
      ...parsedBody,
      mainPhoto: mainPhotoUrl,
      units: units,
    };

    const course = await courseRepo.create(courseData);
    res.status(201).json(course);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await courseRepo.findAll();
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await courseRepo.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { body, files } = req;

    const parsedBody = qs.parse(body);

    const mainPhotoUrl = files.mainPhoto && files.mainPhoto[0] ? files.mainPhoto[0].path : null;
    const videoUrl =
      files.videoUrl && files.videoUrl[0]
        ? await uploadToVimeo(files.videoUrl[0].path, files.videoUrl[0].originalname)
        : null;
    const documents =
      files.documents && files.documents?.length > 0
        ? files.documents?.map((file) => file.path)
        : [];

    const units = [];
    if (parsedBody.units && Array.isArray(parsedBody.units)) {
      for (let i = 0; i < parsedBody.units.length; i++) {
        const unit = {
          name: parsedBody.units[i].name,
          description: parsedBody.units[i].description,
          price: parseFloat(parsedBody.units[i].price),
          duration: parseFloat(parsedBody.units[i].duration),
          sessions: [],
        };

        if (parsedBody.units[i].sessions && Array.isArray(parsedBody.units[i].sessions)) {
          for (let j = 0; j < parsedBody.units[i].sessions.length; j++) {
            const session = {
              name: parsedBody.units[i].sessions[j].name,
              duration: parseFloat(parsedBody.units[i].sessions[j].duration),
              freePreview: parsedBody.units[i].sessions[j].freePreview === 'true',
              videoUrl: videoUrl,
              documents: documents,
            };
            unit.sessions.push(session);
          }
        }

        units.push(unit);
      }
    }

    const updateData = {
      ...parsedBody,
      mainPhoto: mainPhotoUrl || parsedBody.mainPhoto,
      units: units,
    };

    const course = await courseRepo.update(req.params.id, updateData);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.status(200).json(course);
  } catch (error) {
    console.error(error.message);
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
