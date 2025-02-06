const express = require('express');
const multer = require('multer');
const { uploadVideoFile } = require('../controllers/videoController');

const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('video'), uploadVideoFile);

module.exports = router;
