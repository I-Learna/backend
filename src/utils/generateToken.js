const jwt = require('jsonwebtoken');

// Generate Access Token
const generateAccessToken = (id) => {
  try {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  } catch (error) {
    return error.message;
  }
};

// Generate Refresh Token
const generateRefreshToken = (id) => {
  try {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  } catch (error) {
    return error.message;
  }
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return error.message;
  }
};

const generateToken = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
};

module.exports = generateToken;
