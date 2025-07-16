const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Guest = require('../models/Guest');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type === 'user') {
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ error: 'Invalid token. User not found.' });
      }
      req.user = {
        id: user._id.toString(),
        _id: user._id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin || false, // fallback
      };
      req.userType = 'user';
    }
     else if (decoded.type === 'guest') {
      const guest = await Guest.findOne({ guestId: decoded.guestId });
      if (!guest) {
        return res.status(401).json({ error: 'Invalid token. Guest session expired.' });
      }
      // Update guest activity
      await guest.updateActivity();
      req.user = guest;
      req.userType = 'guest';
    } else {
      return res.status(401).json({ error: 'Invalid token type.' });
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = authMiddleware;