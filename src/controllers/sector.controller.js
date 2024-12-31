const Sector = require('../model/sector.model');

exports.getAllSectors = async (req, res) => {
  try {
    const sectors = await Sector.find().populate('industryId');
    res.status(200).json(sectors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSectorById = async (req, res) => {
  try {
    const sector = await Sector.findById(req.params.id).populate('industryId');
    if (!sector) return res.status(404).json({ message: 'Sector not found' });
    res.status(200).json(sector);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createSesctor = async (req, res) => {
  try {
    const sector = new Sector(req.body);
    await sector.save();
    res.status(201).json(sector);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateSector = async (req, res) => {
  try {
    const sector = await Sector.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!sector) return res.status(404).json({ message: 'Sector not found' });
    res.status(200).json(sector);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteSector = async (req, res) => {
  try {
    const sector = await Sector.findByIdAndDelete(req.params.id);
    if (!sector) return res.status(404).json({ message: 'Sector not found' });
    res.status(200).json({ message: 'Sector deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
