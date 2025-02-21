const courseRepo = require('../repositories/course.repository');

exports.createCourse = async (req, res) => {
  try {
    const course = await courseRepo.create(req.body);
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
    const course = await courseRepo.update(req.params.id, req.body);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.status(200).json(course);
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
