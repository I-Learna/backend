const ebookRepo = require('../repositories/ebook.repository');
const { uploadMultiple, uploadToVimeo } = require('../utils/uploadUtil'); // Import from uploadUtil.js

const formatEbook = (ebook) => ({
  ...ebook,
  finalPrice: ebook.finalPrice,
});

exports.uploadEbookFiles = uploadMultiple([
  { name: 'mainPhoto', maxCount: 1 },
  { name: 'doc', maxCount: 1 },
  { name: 'video', maxCount: 1 },
]);

exports.createEbook = async (req, res) => {
  try {
    const { body, files } = req;

    if (!files) {
      return res.status(400).json({ success: false, message: 'Files are required' });
    }

    const mainPhotoUrl = files.mainPhoto && files.mainPhoto[0] ? files.mainPhoto[0].path : null;
    const docUrl = files.doc && files.doc[0] ? files.doc[0].path : null;
    const videoUrl = files.video && files.video[0] ? files.video[0].path : null;

    if (!mainPhotoUrl || !docUrl || !videoUrl) {
      return res.status(400).json({
        success: false,
        message: 'All required files (main photo, document, video) must be uploaded',
      });
    }

    const fileUrl = await uploadToVimeo(videoUrl, files.video[0].originalname);

    const ebookData = {
      ...body,
      doc: docUrl,
      mainPhoto: mainPhotoUrl,
      video: fileUrl,
    };

    const ebook = await ebookRepo.create(ebookData);

    res.status(201).json({ success: true, ebook: formatEbook(ebook.toObject()) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateEbook = async (req, res) => {
  try {
    const { body, files } = req;
    let ebookData = { ...body };

    if (files.mainPhoto) {
      ebookData.mainPhoto = files.mainPhoto[0].path;
    }

    if (files.doc) {
      ebookData.doc = files.doc[0].path;
    }

    if (files.video) {
      const videoPath = files.video[0].path;
      ebookData.video = await uploadToVimeo(videoPath, files.video[0].originalname);
    }

    const ebook = await ebookRepo.update(req.params.id, ebookData);

    if (!ebook) {
      return res.status(404).json({ success: false, message: 'Ebook not found' });
    }

    res.json({ success: true, ebook: formatEbook(ebook.toObject()) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEbooks = async (req, res) => {
  try {
    const ebooks = await ebookRepo.findAll();
    res.json({ success: true, ebooks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEbookById = async (req, res) => {
  try {
    const ebook = await ebookRepo.findById(req.params.id);
    if (!ebook) return res.status(404).json({ success: false, message: 'Ebook not found' });
    res.json({ success: true, ebook });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteEbook = async (req, res) => {
  try {
    const ebook = await ebookRepo.delete(req.params.id);
    if (!ebook) return res.status(404).json({ success: false, message: 'Ebook not found' });

    res.json({ success: true, message: 'Ebook deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
