const axios = require('axios');
const SavedPaper = require('../models/SavedPaper');
const reportActivity = require('../utilities/reportActivity');


exports.searchPapers = async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: 'Query is required' });

  try {
    const response = await axios.get(`https://api.semanticscholar.org/graph/v1/paper/search`, {
      params: {
        query,
        limit: 20,
        fields: 'title,authors,url,abstract,year'
      }
    });

    const results = response.data.data.map(paper => ({
      paperId: paper.paperId,
      title: paper.title,
      authors: paper.authors?.map(a => a.name) || [],
      url: paper.url,
      abstract: paper.abstract,
      year: paper.year
    }));

    res.json(results);
  } catch (err) {
    console.error('Semantic Scholar error:', err.message);
    res.status(500).json({ error: 'Failed to fetch papers' });
  }
};

exports.savePaper = async (req, res) => {
    const { title, authors, url, abstract, year } = req.body;
    const userId = req.user._id;
  
    if (!title || !url) return res.status(400).json({ error: 'Missing fields' });
  
    try {
      const saved = await SavedPaper.create({
        userId,
        title,
        authors,
        url,
        abstract,
        year
      });

      await reportActivity({
        userId,
        source: 'research',
        type: 'saved',
        title,
        link: url // link goes directly to the paper
      });
      
  
      res.status(201).json({
        _id: saved._id,
        title: saved.title,
        authors: saved.authors,
        url: saved.url,
        abstract: saved.abstract,
        year: saved.year,
        createdAt: saved.createdAt
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to save paper' });
    }
  };
  

exports.getSavedPapers = async (req, res) => {
  try {
    const papers = await SavedPaper.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(papers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get saved papers' });
  }
};

exports.deleteSavedPaper = async (req, res) => {
    const paperId = req.params.id;
    const userId = req.user._id;
  
    try {
      const deleted = await SavedPaper.findOneAndDelete({ _id: paperId, userId });
      if (!deleted) return res.status(404).json({ error: 'Paper not found or not authorized' });
  
      res.json({ message: 'Paper deleted', id: paperId });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete paper' });
    }
  };
  


