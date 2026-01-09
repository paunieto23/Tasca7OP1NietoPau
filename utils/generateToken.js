const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT for a user.
 * Payload includes: userId, email, role.
 */
function generateToken(user) {
  const payload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

module.exports = generateToken;
