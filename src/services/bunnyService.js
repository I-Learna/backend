const axios = require('axios');

const bunnyAPI = axios.create({
  baseURL: 'https://storage.bunnycdn.com',
  headers: {
    AccessKey: process.env.BUNNY_API_KEY,
  },
});

const uploadVideo = async (file, storageZone) => {
  const formData = new FormData();
  formData.append('file', file);
  console.log('Form Data:', formData);

  try {
    const response = await bunnyAPI.post(`/spaces/${storageZone}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        AccessKey: process.env.BUNNY_API_KEY,
      },
    });
    console.log('Upload Success:', response.data);

    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    } else {
      console.error('Error message:', error.message);
    }
    throw new Error('Error uploading video: ' + error.message);
  }
};

module.exports = {
  uploadVideo,
};
