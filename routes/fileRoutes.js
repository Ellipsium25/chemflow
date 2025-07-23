const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const auth = require('../middleware/auth');
const fileController = require('../controllers/fileController');
const authMiddleware = require('../middleware/auth');


// Multer setup
const storage = multer.memoryStorage(); // No longer saves to disk


const upload = multer({ storage });

// Routes
router.post('/upload', auth, upload.single('file'), fileController.uploadFile);
router.get('/myfiles', auth, fileController.getUserFiles);
router.delete('/:fileId', auth, fileController.deleteFile);


module.exports = router;
