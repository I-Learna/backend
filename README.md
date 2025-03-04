## update validation error for routers auth router

```
const {
  userValidationRegistration,
  userValidationLogin,
  userValidationEmail,
  userValidationResetPassword,
  userValidationChangePassword,
} = require('../validation/userValidationRules');


router.post('/login', validateRequest(userValidationLogin), User.loginUser);


router.post('/forget-password', validateRequest(userValidationEmail), User.forgotPassword);
router.post(
  '/reset-password/:resetToken',
  validateRequest(userValidationResetPassword),
  User.resetPassword
);
router.post(
  '/change-password',
  protect,
  validateRequest(userValidationChangePassword),
  User.changePassword
);
```

## add validation rule in userValidationRule

```
const userValidationLogin = [
  // Validate email
  body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),

  // Validate password
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long!')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character!'
    ),
];

const userValidationEmail = [
  // Validate email
  body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
];

const userValidationResetPassword = [
  // Validate password newPassword, confirmPassword
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long!')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character!'
    ),

  body('confirmPassword')
    .isLength({ min: 8 })
    .withMessage('Confirm Password must be at least 8 characters long!')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Confirm Password must match Password');
      }
      return true;
    }),
];

const userValidationChangePassword = [
  // Validate oldPassword, newPassword, confirmPassword
  body('oldPassword')
    .isLength({ min: 8 })
    .withMessage('Old Password must be at least 8 characters long!')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character!'
    ),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New Password must be at least 8 characters long!')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character!'
    ),

  body('confirmPassword')
    .isLength({ min: 8 })
    .withMessage('Confirm Password must be at least 8 characters long!')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Confirm Password must match Password');
      }
      return true;
    }),
];

module.exports = {
  userValidationRegistration,
  userValidationLogin,
  userValidationEmail,
  userValidationResetPassword,
  userValidationChangePassword,
};


```

### schema for requeste as a freelancer

full name
professional summary or bio
phone number
residence country
nationality
date of birth
industry Id ( many id )
sector Id ( many id )
total years of experience
how did you hear abour ilearna?

have you taught online before ? Y / N default N
what langauge could you tech ?

profissonal certificate ( array of [ name , attached ] )

resume
introduce your selfe ( video )

profileImage
socialLinks

## api route logout : need a middleware protect

## ebooks model change industry , sector to be an array

## Date 2-Mar-2025

## course schema

```
  industry: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Industry', required: true }],
  sector: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sector', required: true }],

  testVideoUrl: { type: String, required: true },

```

## course.controller

## add videurl testvideo

```
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
```

## course.controller createUnit add check for course_id

```
   // check courseId is exist
    const course = await courseRepo.findCourseById(courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });

```

## course.repository >> find qurey for units take courseId to find the realted course

```
exports.findAllUnits = async (courseId) => {
  return Unit.find({ courseId })
    .populate('courseId', 'name description')
    .populate('sessions', 'name duration videoUrl freePreview')
    .select('-__v -createdAt -updatedAt');
};
```

## course.controller createSession

```
  // check if unitId is exist
    const unit = await courseRepo.findUnitById(unitId);
    if (!unit) return res.status(404).json({ error: 'Unit not found' });

```


## industry.repository

```

const findIndustryIdsIsExist = async (industryIds) => {
  return await Industry.find({ _id: { $in: industryIds } });
};

```

## sector.repository 

```
const findSectorIdsIsExist = async (ids) => {
  return await Sector.find({ _id: { $in: ids } });
};

```

## update course controller createCourse
## check if industry and sectore are exists

```
  // check if req.body.industry is exist in industry model
  const industry = await industryRepo.findIndustryIdsIsExist(parsedBody.industry);
  if (!industry) return res.status(404).json({ error: 'Industry not found' });

  // check if req.body.sector is exist in sector model
  const sector = await sectorRepo.findSectorIdsIsExist(parsedBody.sector);
  if (!sector) return res.status(404).json({ error: 'Sector not found' });


```

## adjust  cours repo findAllSessions
```
exports.findAllSessions = async (unitId) => {
  return Session.find({ unitId }).populate('unitId', 'name description').select('-__v -createdAt -updatedAt');
};

```
## and adjust getAllSessions

```
exports.getAllSessions = catchAsync(async (req, res, next) => {
  // check if unitId is exist
  const { unitId } = req.params;
  const unit = await courseRepo.findUnitById(unitId);
  if (!unit) return next(new AppErr('Unit not found', 404));

  const sessions = await courseRepo.findAllSessions(unitId);
  if (sessions.length === 0) return next(new AppErr('Sessions not found', 404));
  res.status(200).json({ status: 'Success', length: sessions.length, sessions });

});
```

## add check courseID in approve and publish
```

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
```

## pending checking for update 
## 