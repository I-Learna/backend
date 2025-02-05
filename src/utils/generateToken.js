const jwt = require('jsonwebtoken');

// Generate Access Token
const generateAccessToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Generate Refresh Token
const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};


const generateToken = {
    generateAccessToken,
    generateRefreshToken,
    verifyToken
};

module.exports = generateToken;