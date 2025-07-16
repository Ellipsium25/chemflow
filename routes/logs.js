// routes/logs.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const logController = require('../controllers/logController');

// Apply auth middleware to all routes
router.use(auth);

// GET /api/logs - Get all logs for current user
router.get('/', logController.getAllLogs);

// GET /api/logs/:id - Get single log by ID
router.get('/:id', logController.getLogById);

// POST /api/logs - Create new log
router.post('/', logController.createLog);

// PUT /api/logs/:id - Update existing log
router.put('/:id', logController.updateLog);

// DELETE /api/logs/:id - Delete log
router.delete('/:id', logController.deleteLog);

module.exports = router;