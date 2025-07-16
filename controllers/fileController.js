const path = require('path');
const fs = require('fs');
const File = require('../models/File');

exports.uploadFile = async (req, res) => {
    try {
      const file = req.file;
      if (!file) return res.status(400).json({ error: 'No file uploaded' });
  
      const newFile = new File({
        owner: req.user._id,
        originalName: file.originalname,
        storedName: file.filename,
        mimeType: file.mimetype,
        path: path.relative(path.join(__dirname, '..'), file.path),
      });
  
      await newFile.save();
  
      res.json({ message: 'File uploaded successfully', file: newFile });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Upload failed' });
    }
  };
  

  exports.renameFile = async (req, res) => {
    try {
      const { fileId } = req.params;
      const { newName } = req.body;
  
      console.log('Rename request:', fileId, newName, 'User:', req.user._id);
  
      const file = await File.findOne({ _id: fileId, owner: req.user._id });
      if (!file) {
        console.log('File not found');
        return res.status(404).json({ error: 'File not found' });
      }
  
      const currentExt = path.extname(file.originalName);
      const requestedExt = path.extname(newName);
  
      if (requestedExt && requestedExt !== currentExt) {
        console.log('Attempt to change file extension blocked');
        return res.status(400).json({ error: 'Changing file extension is not allowed.' });
      }
  
      const baseNewName = path.basename(newName, requestedExt || currentExt);
      const finalName = baseNewName + currentExt;
  
      const uploadDir = path.join(__dirname, '../uploads', `uploads_user_${req.user._id}`);
      const oldPath = path.join(uploadDir, file.storedName);

  
      console.log('Old file path:', oldPath);
  
      const newStoredName = `${Date.now()}-${Math.floor(Math.random() * 100000)}${currentExt}`;
      const newPath = path.join(uploadDir, newStoredName);
      console.log('New file path:', newPath);
  
      fs.renameSync(oldPath, newPath);
  
      file.originalName = finalName;
      file.storedName = newStoredName;
      file.path = path.relative(path.join(__dirname, '..'), newPath);

      await file.save();
  
      res.json({ message: 'File renamed successfully', file });
  
    } catch (err) {
      console.error('Rename error:', err);
      res.status(500).json({ error: 'Rename failed', details: err.message });
    }
  };
  
exports.getUserFiles = async (req, res) => {
    try {
      const files = await File.find({ owner: req.user._id }).sort({ updatedAt: -1 });
  
      // Map files to add URL and rename fields for frontend convenience
      const mappedFiles = files.map(file => ({
        _id: file._id,
        originalName: file.originalName,
        storedName: file.storedName,
        mimeType: file.mimeType,    // exact casing as in DB
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
        url: `/uploads/uploads_user_${req.user._id}/${file.storedName}`, // this URL must be accessible statically from Express
      }));
  
      res.json(mappedFiles);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch files' });
    }
  };
  


exports.deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await File.findOneAndDelete({ _id: fileId, owner: req.user._id });

    if (!file) return res.status(404).json({ error: 'File not found' });

    fs.unlink(file.path, (err) => {
      if (err) console.error('Error deleting file from disk:', err);
    });

    res.json({ message: 'File deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
};


