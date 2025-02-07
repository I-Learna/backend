const AppErr = require('../middlewares/appErr');
const catchAsync = require('../middlewares/catchAsync');

const {
  getAll,
  findBySlug,
  updateById,
  create,
  deleteById,
  getById,
  findBySlugInDiffrentId,
} = require('../repositories/sector.repository');
const { capitalizeWords, formatArabicName, formatEnglishName } = require('../utils/slugifyName');

exports.getAllSectors = catchAsync(async (req, res, next) => {
  const sectors = await getAll();
  if (!sectors.length) return next(new AppErr('No sectors yet', 404));
  return res.status(200).json({ status: 'success', data: sectors });
});

exports.getSectorById = catchAsync(async (req, res, next) => {
  const sector = await getById(req.params.id);
  if (!sector) return next(new AppErr('Sector not found', 400));
  res.status(200).json({ message: 'success', data: sector });
});

exports.createSector = catchAsync(async (req, res, next) => {
  const { name, name_ar } = req.body;

  let capitalize = capitalizeWords(name);
  const formattedNameAr = formatArabicName(name_ar);
  const formattedName = formatEnglishName(name); // Access and format the English name

  const existingSector = await findBySlug(formattedName, formattedNameAr);
  if (existingSector) return next(new AppErr('Sector already exists', 400));

  const newSector = {
    name: capitalize,
    name_ar: name_ar.toLowerCase(),
  };

  const sector = await create(newSector);
  res.status(201).json({ message: 'Sector created successfully', data: sector });
});

exports.updateSector = catchAsync(async (req, res, next) => {
  const { name, name_ar } = req.body;

  if (!name && !name_ar) {
    return next(new AppErr('Please provide either name or Arabic name', 400));
  }

  const capitalize = capitalizeWords(name);
  const formattedName = formatEnglishName(name);
  const formattedNameAr = formatArabicName(name_ar);

  // Check if the record exists with the same ID
  const sameSector = await getById(req.params.id);
  if (!sameSector) {
    return next(new AppErr('Sector not found', 404));
  }
  // Check if the record exists with the same name or Arabic name in different ID
  const existingSector = await findBySlugInDiffrentId(
    formattedName,
    formattedNameAr,
    req.params.id
  );
  if (existingSector) {
    return next(new AppErr('Sector already exists with the same name or Arabic name', 400));
  }

  // إذا لم يكن هناك تغيير، أعد البيانات بدون تحديث
  if (sameSector.slugName === formattedName && sameSector.slugName_ar === formattedNameAr) {
    return res.status(200).json({ message: 'No Change', data: sameSector });
  }

  // تحديث السجل إذا لم تكن هناك تعارضات
  const updatedSector = await updateById(req.params.id, {
    name: capitalize,
    name_ar: name_ar.toLowerCase(),
    slugName: formattedName,
    slugName_ar: formattedNameAr,
  });

  res.status(200).json({ message: 'success', data: updatedSector });
});

exports.deleteSector = async (req, res) => {
  const sector = await deleteById(req.params.id);
  if (!sector) return res.status(404).json({ message: 'Sector not found' });
  res.status(200).json({ message: 'Sector deleted' });
};
