const streamifier = require('streamifier');
const cloudinary = require('../utilities/cloudinary');
const path = require('path');
const fs = require('fs');
const File = require('../models/File');

exports.uploadFile = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const streamUpload = () =>
      new Promise((resolve, reject) => {
        const uploadOptions = {
          resource_type: 'auto', // handles pdf, docx, images, etc.
          folder: `chemflow_user_${req.user._id}`,
          access_mode: 'public', // This is the line we're checking
        };
        console.log('Cloudinary Upload Options being sent:', uploadOptions);
        const stream = cloudinary.uploader.upload_stream(
          uploadOptions, // Pass the options variable here
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(file.buffer).pipe(stream);
      });

    const result = await streamUpload();

    const newFile = new File({
      owner: req.user._id,
      originalName: file.originalname,
      storedName: result.public_id,
      mimeType: file.mimetype,
      path: result.secure_url,
      size: file.size,
    });

    await newFile.save();
    res.json({ message: 'File uploaded successfully', file: newFile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
};

  

  
  
  exports.getUserFiles = async (req, res) => {
    try {
      const files = await File.find({ owner: req.user._id }).sort({ updatedAt: -1 });
  
      const mappedFiles = files.map(file => ({
        _id: file._id,
        originalName: file.originalName,
        storedName: file.storedName,
        mimeType: file.mimeType,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
        url: file.path, // direct Cloudinary link
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
  
      await cloudinary.uploader.destroy(file.storedName, {
        resource_type: 'auto'
      });
  
      res.json({ message: 'File deleted' });
    } catch (err) {
      res.status(500).json({ error: 'Delete failed' });
    }
  };
  


