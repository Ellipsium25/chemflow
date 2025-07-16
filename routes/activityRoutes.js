const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const activityController = require('../controllers/activityController');
const auth = require('../middleware/auth');

router.delete('/:id', auth, async (req, res) => {
    try {
      console.log('Delete attempt for activity ID:', req.params.id);
      console.log('Authenticated user ID:', req.user.id);
  
      const activity = await Activity.findById(req.params.id);
  
      if (!activity) {
        console.log('Activity not found');
        return res.status(404).json({ message: 'Activity not found' });
      }
  
      if (activity.userId.toString() !== req.user.id) {
        console.log('Unauthorized delete attempt');
        return res.status(403).json({ message: 'Not authorized to delete this activity' });
      }
  
      await activity.deleteOne(); // safer than .remove()
  
      console.log('Activity deleted successfully');
      res.json({ success: true, message: 'Activity deleted' });
    } catch (error) {
      console.error('Delete activity error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  

router.get('/recent', auth, activityController.getRecentActivity);

module.exports = router;
