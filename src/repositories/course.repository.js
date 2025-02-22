const { Course, Unit, Session } = require('../models/course.model');

exports.create = async (courseData) => {
  const { units, ...courseFields } = courseData;

  console.log('Received course data:', JSON.stringify(courseData, null, 2));

  const newCourse = new Course(courseFields);
  await newCourse.save();

  let totalDuration = 0;
  let totalSessions = 0;
  let totalUnits = 0;
  let totalPrice = 0;

  let savedUnits = [];

  if (units && Array.isArray(units)) {
    console.log('Received units:', JSON.stringify(units, null, 2));

    for (let unit of units) {
      const newUnit = new Unit({
        ...unit,
        courseId: newCourse._id,
      });

      let sessionIds = [];

      if (unit.sessions && Array.isArray(unit.sessions)) {
        console.log('Received sessions:', JSON.stringify(unit.sessions, null, 2));

        for (let session of unit.sessions) {
          const newSession = new Session({
            ...session,
            unitId: newUnit._id,
          });
          await newSession.save();
          sessionIds.push(newSession._id);

          totalSessions++;
          totalDuration += newSession.duration;
        }
      }

      newUnit.sessions = sessionIds;
      await newUnit.save();
      savedUnits.push(newUnit._id);

      totalUnits++;
      totalPrice += newUnit.price;
      totalDuration += newUnit.duration;
    }
  }

  newCourse.units = savedUnits;
  newCourse.totalDuration = totalDuration;
  newCourse.totalSessions = totalSessions;
  newCourse.totalUnits = totalUnits;
  newCourse.price = totalPrice;

  await newCourse.save();

  return Course.findById(newCourse._id)
    .populate('industry sector coupon')
    .populate({
      path: 'units',
      populate: { path: 'sessions' },
    });
};

exports.findAll = async () => {
  return Course.find()
    .populate('industry', 'name name_ar options')
    .populate('sector', 'name description')
    .populate('coupon', 'name')
    .populate({
      path: 'units',
      populate: { path: 'sessions' },
    });
};

exports.findById = async (id) => {
  return Course.findById(id)
    .populate('industry', 'name name_ar options')
    .populate('sector', 'name description')
    .populate('coupon', 'name')
    .populate({
      path: 'units',
      populate: { path: 'sessions' },
    });
};

exports.update = async (id, updateData) => {
  return Course.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
    .populate('industry', 'name name_ar options')
    .populate('sector', 'name description')
    .populate('coupon', 'name')
    .populate({
      path: 'units',
      populate: { path: 'sessions' },
    });
};

exports.delete = async (id) => {
  return Course.findByIdAndDelete(id);
};
