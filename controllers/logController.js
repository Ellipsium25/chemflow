// controllers/logController.js
const Log = require('../models/Log');
const reportActivity = require('../utilities/reportActivity')


const logController = {
  // Get all logs for the authenticated user
  getAllLogs: async (req, res) => {
    try {
      const logs = await Log.find({ userId: req.user.id })
        .sort({ updatedAt: -1 })
        .select('title createdAt updatedAt');
      
      res.json({
        success: true,
        data: logs
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching logs',
        error: error.message
      });
    }
  },

  // Get a single log by ID
  getLogById: async (req, res) => {
    try {
      const log = await Log.findOne({
        _id: req.params.id,
        userId: req.user.id
      });

      if (!log) {
        return res.status(404).json({
          success: false,
          message: 'Log not found'
        });
      }

      res.json({
        success: true,
        data: log
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching log',
        error: error.message
      });
    }
  },

  // Create a new log
  createLog: async (req, res) => {
    try {
      const { title, content } = req.body;

      if (!title || !content) {
        return res.status(400).json({
          success: false,
          message: 'Title and content are required'
        });
      }

      const log = new Log({
        title: title.trim(),
        content,
        userId: req.user.id
      });

      await log.save();

      await reportActivity({
        userId: req.user.id,
        source: 'lablogs',
        type: 'created',
        title: log.title,
        link: `/labLogs.html`
      });

      res.status(201).json({
        success: true,
        data: log
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating log',
        error: error.message
      });
    }
  },

  // Update an existing log
  updateLog: async (req, res) => {
    try {
      const { title, content } = req.body;

      if (!title || !content) {
        return res.status(400).json({
          success: false,
          message: 'Title and content are required'
        });
      }

      const log = await Log.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id },
        { 
          title: title.trim(), 
          content,
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!log) {
        return res.status(404).json({
          success: false,
          message: 'Log not found'
        });
      }

      await reportActivity({
        userId: req.user.id,
        source: 'lablogs',
        type: 'updated',
        title: log.title,
        link: `/labLogs.html`
      });

      res.json({
        success: true,
        data: log
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating log',
        error: error.message
      });
    }
  },

  // Delete a log
  deleteLog: async (req, res) => {
    try {
      const log = await Log.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.id
      });

      if (!log) {
        return res.status(404).json({
          success: false,
          message: 'Log not found'
        });
      }

      res.json({
        success: true,
        message: 'Log deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting log',
        error: error.message
      });
    }
  }
};

module.exports = logController;