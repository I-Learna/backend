const slugify = require('slugify');
const Industry = require('../model/industry.model');

exports.getAllIndustries = async (req, res) => {
  try {
    const industries = await Industry.find();
    res.status(200).json(industries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getIndustryById = async (req, res) => {
  try {
    const industry = await Industry.findById(req.params.id);
    if (!industry) return res.status(404).json({ message: 'Industry not found' });
    res.status(200).json(industry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createIndustry = async (req, res) => {
  const { name, description } = req.body;

  try {
    const formattedName = slugify(name, {
      replacement: ' ',
      lower: true,    // Convert to lowercase
      strict: true,   // Remove special characters
      trim: true,     // Remove leading and trailing spaces
    })

    const existingIndustry = await Industry.findOne({ name: formattedName });
    if (existingIndustry) return res.status(400).json({ message: 'Industry already exists' });

    const industry = new Industry({ name: formattedName, description });
    await industry.save();
    res.status(201).json(industry);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateIndustry = async (req, res) => {
  try {
    const industry = await Industry.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!industry) return res.status(404).json({ message: 'Industry not found' });
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
