const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const Vimeo = require('vimeo').Vimeo;
const vimeoConfig = require('../../config/Vimeo.config');

const vimeoClient = new Vimeo(
  vimeoConfig.CLIENT_ID,
  vimeoConfig.CLIENT_SECRET,
  vimeoConfig.ACCESS_TOKEN
);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = path.join(__dirname, '../../uploads/files/');

    if (file.fieldname === 'ebook') {
      uploadPath = path.join(__dirname, '../../uploads/ebooks/');
    } else if (file.fieldname === 'profile') {
      uploadPath = path.join(__dirname, '../../uploads/profiles/');
    }

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

exports.uploadSingle = (fieldName) => upload.single(fieldName);
exports.uploadMultiple = (fields) => upload.fields(fields);

exports.uploadToVimeo = async (filePath, originalName) => {
  try {
    if (!filePath || !originalName) {
      throw new Error('Invalid file path or name received.');
    }

    console.log('Uploading video:', filePath);

    return new Promise((resolve, reject) => {
      vimeoClient.upload(
        filePath,
        { name: originalName, description: 'Video upload' },
        async (uri) => {
          if (!uri) return reject(new Error('Vimeo upload failed: No URI returned'));

          console.log('File uploaded to Vimeo:', uri);

          const videoId = uri.split('/')[2];
          if (!videoId) return reject(new Error('Failed to extract video ID from URI'));

          vimeoClient.request({ method: 'GET', path: `/videos/${videoId}` }, (error, body) => {
            if (error) {
              console.error('Error fetching video details:', error);
              return reject(new Error('Failed to fetch video details'));
            }
            resolve(body.link || `https://vimeo.com/${videoId}`);
          });
        },
        (bytesUploaded, bytesTotal) => {
          console.log(`Uploading: ${((bytesUploaded / bytesTotal) * 100).toFixed(2)}%`);
        },
        (error) => {
          console.error('Vimeo Upload Error:', error.message);
          reject(new Error('Vimeo upload failed'));
        }
      );
    });
  } catch (error) {
    console.error('Vimeo Upload Error:', error.message);
    throw new Error('Vimeo upload failed');
  }
};
