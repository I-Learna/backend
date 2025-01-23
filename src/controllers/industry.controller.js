const AppErr = require('../middlewares/appErr');
const catchAsync = require('../middlewares/catchAsync');
const Industry = require('../model/industry.model');
const { formatArabicName, formatEnglishName, capitalizeWords } = require('../utils/slugifyName');
const { getAll, getById, create, updateById, deleteById, findBySlug, findExact, findBySlugAndId } = require('../repositories/industry.repository');

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
  const formattedName = formatEnglishName(name); // Access and format the English name
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

  // التحقق إذا كان السجل موجودًا بنفس الاسم أو الاسم العربي مع ID مختلف
  const existingIndustry = await findBySlugAndId(formattedName, formattedNameAr, req.params.id);
  if (existingIndustry) {
    return next(new AppErr('Sector already exists with the same name or Arabic name', 400));
  }

  // التحقق من أن السجل موجود بناءً على الـ ID المطلوب
  const sameIndustry = await getById(req.params.id);
  if (!sameIndustry) {
    return next(new AppErr('Sector not found', 404));
  }

  // إذا لم يكن هناك تغيير، أعد البيانات بدون تحديث
  if (sameIndustry.slugName === formattedName && sameIndustry.slugName_ar === formattedNameAr) {
    return res.status(200).json({ message: 'No Change', data: sameIndustry });
  }

  // تحديث السجل إذا لم تكن هناك تعارضات
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
  res.status(200).json({ message: 'success', data: industry });
});
