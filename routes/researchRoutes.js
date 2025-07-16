const express = require('express');
const authenticateUser = require('../middleware/auth');
const {
    searchPapers,
    savePaper,
    getSavedPapers,
    deleteSavedPaper
  } = require('../controllers/researchController');
  

const router = express.Router();

router.get('/search', authenticateUser, searchPapers);
router.post('/save', authenticateUser, savePaper);
router.get('/saved', authenticateUser, getSavedPapers);
router.delete('/saved/:id', authenticateUser, deleteSavedPaper);

module.exports = router;
