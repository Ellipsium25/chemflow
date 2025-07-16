const Activity = require('../models/Activity');

const activityController = {
  // GET /api/activity/recent
  getRecentActivity: async (req, res) => {
    try {
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

      const activities = await Activity.find({
        userId: req.user._id,
        createdAt: { $gte: fiveDaysAgo }
      })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('source type title link createdAt');

      res.json(activities);
    } catch (err) {
      res.status(500).json({ error: 'Failed to load recent activity' });
    }
  }
};

module.exports = activityController;
