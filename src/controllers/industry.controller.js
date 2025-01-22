const AppErr = require('../middlewares/appErr');
const catchAsync = require('../middlewares/catchAsync');
const Industry = require('../model/industry.model');
const { formatArabicName, formatEnglishName, capitalizeWords } = require('../utils/slugifyName');

exports.getAllIndustries = catchAsync(async (req, res, next) => {
  const industries = await Industry.find().excludeFields();
  if (!industries.length) return next(new AppErr('No industries yet', 404))
  return res.status(200).json({ status: 'success', data: industries })
});

exports.getIndustryById = catchAsync(async (req, res, next) => {
  const industry = await Industry.findById(req.params.id).includeFields();
  if (!industry) return next(new AppErr('Industry not found', 404));
  res.status(200).json({ message: 'success', data: industry });

});

exports.createIndustry = catchAsync(async (req, res, next) => {
  const { name, name_ar } = req.body;
  let capitalize = capitalizeWords(name);
  const industry = new Industry({ name: capitalize, name_ar: name_ar.toLowerCase() });
  // Save the new industry
  await industry.save();
  // Respond with the created industry
  res.status(201).json({ message: 'Industry created successfully', data: industry });
});


exports.updateIndustry = catchAsync(async (req, res, next) => {
  const { name, name_ar } = req.body;

  if (!name && !name_ar) return next(new AppErr('Please provide either name or arabic name', 400));

  const formattedName = formatEnglishName(name);
  const formattedNameAr = formatArabicName(name_ar);
  console.log(formattedName, formattedNameAr);

  // Check if the name exists with a different ID
  const existingIndustry = await Industry.findOne({
    _id: { $ne: req.params.id },
    slugName: formattedName
  });

  if (existingIndustry) return res.status(400).json({ message: 'Industry already exists' });

  // Check if the name exists with the same ID (no update needed)
  const sameIndustry = await Industry.findOne({
    _id: req.params.id,
    name: formattedName,
  });

  console.log(sameIndustry);

  if (sameIndustry?.slugName === formattedName && sameIndustry?.slugName_ar === formattedNameAr) {
    return res.status(200).json({ message: 'No Change', data: sameIndustry }); // Return without updating
  }

  // Proceed to update if no conflicts
  const industry = await Industry.findByIdAndUpdate(
    req.params.id,
    {
      name: formattedName,
      name_ar: formattedNameAr,
      slugName: formattedName,
      slugName_ar: formattedNameAr
    },
    { new: true }
  );

  res.status(200).json({ message: 'success', data: industry });

});


exports.deleteIndustry = catchAsync(async (req, res, next) => {
  const industry = await Industry.findByIdAndDelete(req.params.id);
  if (!industry) return next(new AppErr('Industry not found', 404));
  res.status(200).json({ message: 'success', data: industry });
});
