const Activity = require('../models/Activity');

const reportActivity = async ({ userId, source, type, title, link }) => {
  try {
    if (!userId || !source || !type || !title || !link) {
      throw new Error('Missing required fields for activity report');
    }

    await Activity.create({
      userId,
      source,
      type,
      title,
      link
    });

  } catch (error) {
    console.error('Failed to report activity:', error.message);
    // Do NOT throw — activity failure should never break main logic
  }
};

module.exports = reportActivity;