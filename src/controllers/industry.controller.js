const AppErr = require('../middlewares/appErr');
const catchAsync = require('../middlewares/catchAsync');
const Industry = require('../model/industry.model');
const formatName = require('../utils/slugifyName');

exports.getAllIndustries = catchAsync(async (req, res, next) => {
  const industries = await Industry.find();
  if (!industries.length) return next(new AppErr('No industries yet', 404))
  return res.status(200).json({ status: 'success', industries })
});

exports.getIndustryById = async (req, res) => {
  try {
    const industry = await Industry.findById(req.params.id);
    if (!industry) return res.status(404).json({ message: 'Industry not found' });
    res.status(200).json(industry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createIndustry = catchAsync(async (req, res, next) => {
  const { name, description } = req.body;

  // Format the name before checking
  const formattedName = formatName(name);
  console.log(formattedName);

  // Check if an industry with the same name already exists
  const existingIndustry = await Industry.findOne({ slugName: formattedName });

  if (existingIndustry) {
    return next(new AppErr('Industry already exists', 409));  // Use 409 Conflict for duplicates
  }

  // Create a new industry
  const industry = new Industry({ name: formattedName, description });

  // Save the new industry
  await industry.save();

  // Respond with the created industry
  res.status(201).json({ message: 'Industry created successfully', data: industry });
});


exports.updateIndustry = async (req, res) => {
  const { name, description } = req.body;

  try {
    const formattedName = formatName(name);

    // Check if the name exists with a different ID
    const existingIndustry = await Industry.findOne({
      _id: { $ne: req.params.id },
      name: formattedName
    });

    if (existingIndustry) {
      return res.status(400).json({ message: 'Industry already exists' });
    }

    // Check if the name exists with the same ID (no update needed)
    const sameIndustry = await Industry.findOne({
      _id: req.params.id,
      name: formattedName,
    });

    if (sameIndustry) {
      return res.status(200).json({ message: 'No Change' }); // Return without updating
    }

    // Proceed to update if no conflicts
    const industry = await Industry.findByIdAndUpdate(
      req.params.id,
      { name: formattedName, description },
      { new: true }
    );

    if (!industry) {
      return res.status(404).json({ message: 'Industry not found' });
    }

    res.status(200).json(industry);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


exports.deleteIndustry = async (req, res) => {
  try {

    const industry = await Industry.findByIdAndDelete(req.params.id);
    if (!industry) return res.status(404).json({ message: 'Industry not found' });
    res.status(200).json({ message: 'Industry deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
