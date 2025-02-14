const ebookRepo = require('../repositories/ebook.repository');

const formatEbook = (ebook) => ({
  ...ebook,
  finalPrice: ebook.finalPrice,
});

exports.createEbook = async (req, res) => {
  try {
    const ebook = await ebookRepo.create(req.body);
    res.status(201).json({ success: true, ebook: formatEbook(ebook.toObject()) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEbooks = async (req, res) => {
  try {
    let ebooks = await ebookRepo.findAll();
    ebooks = ebooks.map(formatEbook);
    res.json({ success: true, ebooks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEbookById = async (req, res) => {
  try {
    let ebook = await ebookRepo.findById(req.params.id);
    if (!ebook) return res.status(404).json({ success: false, message: 'Ebook not found' });

    res.json({ success: true, ebook: formatEbook(ebook) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateEbook = async (req, res) => {
  try {
    let ebook = await ebookRepo.update(req.params.id, req.body);
    if (!ebook) return res.status(404).json({ success: false, message: 'Ebook not found' });

    res.json({ success: true, ebook: formatEbook(ebook) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteEbook = async (req, res) => {
  try {
    let ebook = await ebookRepo.delete(req.params.id);
    if (!ebook) return res.status(404).json({ success: false, message: 'Ebook not found' });

    res.json({ success: true, message: 'Ebook deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
