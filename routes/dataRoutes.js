const express = require('express');
const User = require('../models/User');
const Guest = require('../models/Guest');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get user/guest data



router.get('/data', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const userType = req.userType;

    res.json({
      data: user.data || {},
      preferences: user.preferences || {},
      userType,
      user: {
        id: user._id,
        name: user.name,
        type: userType,
        ...(userType === 'user' ? { email: user.email } : { guestId: user.guestId })
      }
    });
  } catch (error) {
    console.error('Get data error:', error);
    res.status(500).json({ error: 'Failed to get data.' });
  }
});

// Update user/guest data
router.put('/data', authMiddleware, async (req, res) => {
  try {
    const { data, preferences } = req.body;
    const user = req.user;
    const userType = req.userType;

    const updateFields = {};
    if (data !== undefined) updateFields.data = data;
    if (preferences !== undefined) updateFields.preferences = preferences;

    let updatedUser;
    if (userType === 'user') {
      updatedUser = await User.findByIdAndUpdate(
        user._id,
        updateFields,
        { new: true, runValidators: true }
      );
    } else if (userType === 'guest') {
      updatedUser = await Guest.findByIdAndUpdate(
        user._id,
        { ...updateFields, lastActive: new Date() },
        { new: true, runValidators: true }
      );
    }

    res.json({
      message: 'Data updated successfully.',
      data: updatedUser.data || {},
      preferences: updatedUser.preferences || {}
    });
  } catch (error) {
    console.error('Update data error:', error);
    res.status(500).json({ error: 'Failed to update data.' });
  }
});

module.exports = router;