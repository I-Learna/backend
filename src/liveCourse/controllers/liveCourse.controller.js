const qs = require('qs');
const courseRepo = require('../repositories/liveCourse.repository');
const { uploadMultiple, uploadToVimeo } = require('../../utils/uploadUtil');
const { calculatePriceAfterDiscount } = require('../../utils/calculateUtils');

const formatCourse = (course, unit = null) => {
  const coursePriceAfterDiscount = calculatePriceAfterDiscount(course.price, course.discount);
  const unitPriceAfterDiscount = unit
    ? calculatePriceAfterDiscount(unit.price, unit.discount)
    : null;

  return {
    ...course.toObject(),
    priceAfterDiscount:
      unit && unitPriceAfterDiscount ? unitPriceAfterDiscount : coursePriceAfterDiscount,
  };
};

const formatcourses = (course) => ({
  ...course,
  priceAfterDiscount: calculatePriceAfterDiscount(course.price, course.discount),
});

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

    res.status(201).json({ message: 'Course created successfully', course: formatCourse(course) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await courseRepo.findCourseById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.status(200).json({ status: 'Success', course: formatCourse(course) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllCoursesByFreelancerId = async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== 'Freelancer') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const courses = await courseRepo.findAllCourses({
      user: user.id,
      type: 'Live',
      isPublished: true,
    });
    res
      .status(200)
      .json({ status: 'Success', length: courses.length, courses: formatcourses(courses) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getAllFreelancersForCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const instructors = await courseRepo.getAllInstructorsForCourse(courseId);
    res.status(200).json({ status: 'Success', length: instructors.length, instructors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await courseRepo.findAllCourses({});
    res.status(200).json({
      status: 'Success',
      length: courses.length,
      courses: courses.map((course) => formatCourse(course)),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPublishedCourses = async (req, res) => {
  try {
    const courses = await courseRepo.findAllCourses({ isPublished: true });
    res.status(200).json({
      status: 'Success',
      length: courses.length,
      courses: courses.map((course) => formatCourse(course)),
    });
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

    res
      .status(200)
      .json({ message: 'Course updated successfully', course: formatCourse(updatedCourse) });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const deletedCourse = await courseRepo.updateCourse(req.params.id, { isPublished: false });
    if (!deletedCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
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
    res.status(200).json({
      success: true,
      message: 'Course Published successfully',
      course: formatCourse(publishedCourse),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
