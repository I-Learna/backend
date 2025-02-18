require('dotenv').config();

module.exports = {
  CLIENT_ID: process.env.VIMEO_CLIENT_ID,
  CLIENT_SECRET: process.env.VIMEO_CLIENT_SECRE,
  ACCESS_TOKEN: process.env.VIMEO_ACCESS_TOKEN,
};

// module.exports = {
//   STORAGE_ZONE: process.env.BUNNY_STORAGE_ZONE,
//   ACCESS_KEY: process.env.BUNNY_API_KEY,
//   PULL_ZONE_URL: process.env.BUNNY_PULL_ZONE_URL, // Public URL for serving files
//   BASE_URL: `https://storage.bunnycdn.com/${process.env.BUNNY_STORAGE_ZONE}/ebooks/`,
// };
