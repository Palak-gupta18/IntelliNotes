const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Check if the request has an authorization header starting with "Bearer"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header (Format is "Bearer <token>", so we split and take the 2nd part)
      token = req.headers.authorization.split(' ')[1];

      // Verify token using our secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user by ID from the token, but DON'T return their password
      req.user = await User.findById(decoded.id).select('-password');

      next(); // Move on to the next function
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
