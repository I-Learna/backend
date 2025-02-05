const AppErr = require('../middlewares/appErr');
const catchAsync = require('../middlewares/catchAsync');
const Industry = require('../model/industry.model');
const { formatArabicName, formatEnglishName, capitalizeWords } = require('../utils/slugifyName');
const { getAll, getById, create, updateById, deleteById, findBySlug, findExact, findBySlugInDiffrentId } = require('../repositories/industry.repository');

exports.getAllIndustries = catchAsync(async (req, res, next) => {
  const industries = await getAll();
  if (!industries.length) return next(new AppErr('No industries yet', 404))
  return res.status(200).json({ status: 'success', data: industries })
});

exports.getIndustryById = catchAsync(async (req, res, next) => {
  const industry = await getById(req.params.id);
  if (!industry) return next(new AppErr('Industry not found', 404));
  res.status(200).json({ message: 'success', data: industry });

});

exports.createIndustry = catchAsync(async (req, res, next) => {
  const { name, name_ar } = req.body;
  let capitalize = capitalizeWords(name);

  const formattedNameAr = formatArabicName(name_ar);
  const formattedName = formatEnglishName(name);

  // Check if the record already exists with the same name or Arabic name
  const existingIndustry = await findBySlug(formattedName, formattedNameAr)
  if (existingIndustry) return next(new AppErr('Industry already exists', 400));

  const newIndustry = {
    name: capitalize,
    name_ar: name_ar.toLowerCase(),
  };

  const industry = await create(newIndustry);
  res.status(201).json({ message: 'Industry created successfully', data: industry });
});


exports.updateIndustry = catchAsync(async (req, res, next) => {
  const { name, name_ar } = req.body;

  if (!name && !name_ar) {
    return next(new AppErr('Please provide either name or Arabic name', 400));
  }

  const capitalize = capitalizeWords(name);
  const formattedName = formatEnglishName(name);
  const formattedNameAr = formatArabicName(name_ar);

  // Check if the record exists with the same ID
  const sameIndustry = await getById(req.params.id);
  if (!sameIndustry) {
    return next(new AppErr('Sector not found', 404));
  }

  // Check if the record exists with the same name or Arabic name in different ID
  const existingIndustry = await findBySlugInDiffrentId(formattedName, formattedNameAr, req.params.id);
  if (existingIndustry) {
    return next(new AppErr('Industry already exists with the same name or Arabic name', 400));
  }


  // check if No change in name and Arabic name 
  if (sameIndustry.slugName === formattedName && sameIndustry.slugName_ar === formattedNameAr) {
    return next(new AppErr('No data change', 400));
  }

  // Update the record
  const updatedIndustry = await updateById(req.params.id, {
    name: capitalize,
    name_ar: name_ar.toLowerCase(),
    slugName: formattedName,
    slugName_ar: formattedNameAr,
  });
  res.status(200).json({ message: 'success', data: updatedIndustry });
});


exports.deleteIndustry = catchAsync(async (req, res, next) => {
  const industryIsExist = await getById(req.params.id);
  if (!industryIsExist) return next(new AppErr('Industry not found', 404));

  const industry = await deleteById(req.params.id);
  res.status(200).json({ message: 'deleted success' });
});
