const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Guest = require('../models/Guest');
const { v4: uuidv4 } = require('uuid');

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Generate random guest name
const generateGuestName = () => {
  const adjectives = ['Happy', 'Clever', 'Bright', 'Swift', 'Calm', 'Bold', 'Kind', 'Wise', 'Cool', 'Quick'];
  const nouns = ['Panda', 'Fox', 'Eagle', 'Wolf', 'Bear', 'Tiger', 'Lion', 'Owl', 'Hawk', 'Deer'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 1000);
  return `${adj}${noun}${num}`;
};

const authController = {
  // Register new user
  register: async (req, res) => {
    try {
      const { email, password, name } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists.' });
      }

      // Create new user
      const user = new User({
        email,
        password,
        name: name || email.split('@')[0]
      });

      await user.save();

      // Generate token
      const token = generateToken({
        id: user._id,
        email: user.email,
        isAdmin: user.isAdmin,
        type: 'user'
      });

      res.status(201).json({
        message: 'User registered successfully.',
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin,
          type: 'user'
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
  },

  // Login user
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      // Generate token
      const token = generateToken({
        id: user._id,
        email: user.email,
        isAdmin: user.isAdmin,
        type: 'user'
      });

      res.json({
        message: 'Login successful.',
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin,
          type: 'user'
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed. Please try again.' });
    }
  },

  // Create guest session
  guest: async (req, res) => {
    try {
      const guestId = uuidv4();
      const guestName = generateGuestName();

      // Create new guest
      const guest = new Guest({
        guestId,
        name: guestName
      });

      await guest.save();

      // Generate token
      const token = generateToken({
        guestId: guest.guestId,
        name: guest.name,
        type: 'guest'
      });

      res.status(201).json({
        message: 'Guest session created successfully.',
        token,
        user: {
          id: guest._id,
          guestId: guest.guestId,
          name: guest.name,
          type: 'guest'
        }
      });
    } catch (error) {
      console.error('Guest creation error:', error);
      res.status(500).json({ error: 'Failed to create guest session. Please try again.' });
    }
  },

  // Get current user/guest data
  me: async (req, res) => {
    try {
      const user = req.user;
      const userType = req.userType;

      if (userType === 'user') {
        res.json({
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            type: 'user',
            isAdmin: user.isAdmin,
            preferences: user.preferences,
            data: user.data
          }
        });
      } else if (userType === 'guest') {
        res.json({
          user: {
            id: user._id,
            guestId: user.guestId,
            name: user.name,
            type: 'guest',
            preferences: user.preferences,
            data: user.data
          }
        });
      }
    } catch (error) {
      console.error('Get user data error:', error);
      res.status(500).json({ error: 'Failed to get user data.' });
    }
  },

  // Logout (primarily for guest cleanup)
  logout: async (req, res) => {
    try {
      if (req.userType === 'guest') {
        // Delete guest data on logout
        await Guest.findByIdAndDelete(req.user._id);
      }
      
      res.json({ message: 'Logout successful.' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed.' });
    }
  }
};

module.exports = authController;