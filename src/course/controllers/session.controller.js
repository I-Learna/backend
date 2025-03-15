const sessionRepo = require('../repositories/session.repository');
const { uploadMultiple, uploadToVimeo } = require('../../utils/uploadUtil');
const courseRepo = require('../repositories/course.repository');
const unitRepo = require('../repositories/unit.repository');

// Middleware for file uploads
exports.uploadCourseFiles = uploadMultiple([
  { name: 'mainPhoto', maxCount: 1 },
  { name: 'videoUrl', maxCount: 1 },
  { name: 'documents', maxCount: 10 },
]);

exports.createSession = async (req, res) => {
  try {
    const { unitId } = req.params;
    const { name, duration, freePreview } = req.body;
    const { files } = req;

    // check if unitId is exist
    const unit = await unitRepo.findUnitById(unitId);
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

    const session = await sessionRepo.createSession(sessionData);

    res.status(201).json({ message: 'Session created successfully', session: session });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllSessions = async (req, res) => {
  try {
    const sessions = await sessionRepo.findAllSessions();
    res.status(200).json({ status: 'Success', length: sessions.length, sessions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSessionById = async (req, res) => {
  try {
    const session = await sessionRepo.findSessionById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.findSessionsByUnitId = async (req, res) => {
  try {
    const { unitId } = req.params;
    const sessions = await sessionRepo.findSessionsByUnitId(unitId);
    if (!sessions || sessions.length === 0) {
      return res.status(404).json({ error: 'No sessions found for this course' });
    }
    res.status(200).json({ status: 'Success', total: sessions.length, sessions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, duration, freePreview } = req.body;
    const { files } = req;

    const session = await sessionRepo.findSessionById(id);
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

    const updatedSession = await sessionRepo.updateSession(id, updateData);

    const unit = await unitRepo.findUnitById(session.unitId);
    if (unit) {
      const course = await courseRepo.findCourseById(unit.courseId);
      if (course) {
        const updatedUnits = await unitRepo.findUnitsByCourseId(course._id);
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

exports.deleteSession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await sessionRepo.findSessionById(id);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    await sessionRepo.deleteSession(id);

    const unit = await unitRepo.findUnitById(session.unitId);
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
