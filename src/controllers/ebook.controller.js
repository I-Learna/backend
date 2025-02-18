const ebookRepo = require('../repositories/ebook.repository');
const multer = require('multer');
const vimeoConfig = require('../../config/Vimeo.config');
const fs = require('fs');
const path = require('path');
const Vimeo = require('vimeo').Vimeo;
const crypto = require('crypto');

const vimeoClient = new Vimeo(
  vimeoConfig.CLIENT_ID,
  vimeoConfig.CLIENT_SECRET,
  vimeoConfig.ACCESS_TOKEN
);

const formatEbook = (ebook) => ({
  ...ebook,
  finalPrice: ebook.finalPrice,
});
// local storage for (mainPhoto & doc)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = path.join(__dirname, '../../uploads/ebooks/');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(6).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ storage });

exports.uploadEbookFiles = upload.fields([
  { name: 'mainPhoto', maxCount: 1 },
  { name: 'doc', maxCount: 1 },
  { name: 'video', maxCount: 1 },
]);

const uploadToVimeo = async (filePath, originalName) => {
  try {
    if (!filePath || !originalName) {
      throw new Error('Invalid file path or name received.');
    }

    console.log('Uploading video:', filePath);

    return new Promise((resolve, reject) => {
      vimeoClient.upload(
        filePath,
        { name: originalName, description: 'Ebook file upload' },
        async (uri) => {
          if (!uri) {
            return reject(new Error('Vimeo upload failed: No URI returned'));
          }

          console.log('File uploaded to Vimeo:', uri);

          const uriParts = uri.split('/');
          const videoId = uriParts[2];

          if (!videoId) {
            return reject(new Error('Failed to extract video ID from URI'));
          }

          vimeoClient.request({ method: 'GET', path: `/videos/${videoId}` }, (error, body) => {
            if (error) {
              console.error('Error fetching video details:', error);
              return reject(new Error('Failed to fetch video details'));
            }

            const videoUrl = body.link || `https://vimeo.com/${videoId}`;
            console.log('Correct Vimeo URL:', videoUrl);
            resolve(videoUrl);
          });
        },
        (bytesUploaded, bytesTotal) => {
          console.log(`Uploading: ${((bytesUploaded / bytesTotal) * 100).toFixed(2)}%`);
        },
        (error) => {
          console.log(error);
          reject(new Error('Failed to upload to Vimeo'));
        }
      );
    });
  } catch (error) {
    console.error('Vimeo Upload Error:', error.message);
    throw new Error('Vimeo upload failed');
  }
};

exports.createEbook = async (req, res) => {
  try {
    const { body, files } = req;

    console.log(files);

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
