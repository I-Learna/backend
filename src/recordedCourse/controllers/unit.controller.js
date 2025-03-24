const unitRepo = require('../repositories/unit.repository');
const courseRepo = require('../repositories/recordedCourse.repository');
const { uploadMultiple } = require('../../utils/uploadUtil');
const { calculateTotalPrice, calculateTotalDuration } = require('../../utils/calculateUtils');

// Middleware for file uploads
exports.uploadCourseFiles = uploadMultiple([
  { name: 'mainPhoto', maxCount: 1 },
  { name: 'videoUrl', maxCount: 1 },
  { name: 'documents', maxCount: 10 },
]);

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
    const unit = await unitRepo.createUnit(unitData);

    res.status(201).json({ message: 'Unit created successfully', unit: unit });
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

    const courses = await unitRepo.findAllUnits(courseId);
    res.status(200).json({ status: 'Success', length: courses.length, courses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUnitById = async (req, res) => {
  try {
    const course = await unitRepo.findUnitById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.findUnitsByCourseId = async (req, res) => {
  try {
    const { courseId } = req.params;
    const units = await unitRepo.findUnitsByCourseId(courseId);
    if (!units || units.length === 0) {
      return res.status(404).json({ error: 'No units found for this course' });
    }
    res.status(200).json({ status: 'Success', total: units.length, units });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, duration, rating } = req.body;

    const unit = await unitRepo.findUnitById(id);
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

    const updatedUnit = await unitRepo.updateUnit(id, updateData);

    const course = await courseRepo.findCourseById(unit.courseId);
    if (course) {
      const updatedUnits = await unitRepo.findUnitsByCourseId(course._id);

      course.totalDuration = calculateTotalDuration(updatedUnits);
      course.price = calculateTotalPrice(updatedUnits);

      await course.save();
    }

    res.status(200).json({
      message: 'Unit updated successfully',
      unit: updatedUnit,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const unit = await unitRepo.findUnitById(id);
    if (!unit) return res.status(404).json({ error: 'Unit not found' });

    await unitRepo.deleteUnit(id);

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
