const jwt = require('jsonwebtoken');

const signToken = (playload) =>
  jwt.sign(playload, process.env.JWT_SECRET, {
    expiresIn: Date.now() + process.env.TIME_EXPIRED_IN * 24 * 60 * 60,
  });

const decodeToken = (token) => {
  let decoded;
  jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
    decoded = decode;
  });
  return decoded;
};

module.exports = { signToken, decodeToken };
