const path = require('path');
const fs = require('fs');
const { uploadVideo } = require('../services/bunnyService');

const uploadVideoFile = async (req, res) => {
    
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const storageZone = process.env.BUNNY_STORAGE_ZONE;
  console.log(storageZone);
  
  try {
    const videoData = await uploadVideo(req.file, storageZone);
    console.info(videoData);
    res.status(200).json({ message: 'Video uploaded successfully', videoData });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadVideoFile,
};
