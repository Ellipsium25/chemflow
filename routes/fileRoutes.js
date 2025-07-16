const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const auth = require('../middleware/auth');
const fileController = require('../controllers/fileController');
const authMiddleware = require('../middleware/auth');


// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userDir = path.join(__dirname, '../uploads', `uploads_user_${req.user._id}`);
    fs.mkdirSync(userDir, { recursive: true });
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e5);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Routes
router.post('/upload', auth, upload.single('file'), fileController.uploadFile);
router.get('/myfiles', auth, fileController.getUserFiles);
router.patch('/rename/:fileId', auth, fileController.renameFile);
router.delete('/:fileId', auth, fileController.deleteFile);


module.exports = router;
