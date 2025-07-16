const fs = require('fs');
const path = require('path');
const PersonalChemical = require('../models/PersonalChemical');
const Request = require('../models/Request');
const reportActivity = require('../utilities/reportActivity');


// Load chemicals.json once per runtime
const chemicalData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'src', 'chemicals.json'), 'utf-8')
);

// Utilities
const sendResponse = (res, message, id) => {
  return res.json({
    message,
    timestamp: new Date().toISOString(),
    id
  });
};

// 1. Get all personal chemicals
exports.getUserChemicals = async (req, res) => {
  try {
    const chemicals = await PersonalChemical.find({ userId: req.user._id });
    res.json(chemicals);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch personal chemicals.' });
  }
};

// 2. Add new chemical to personal set
exports.addChemicalToSet = async (req, res) => {
    const { name, quantity } = req.body;
  
    try {
      // Find chemical in chemicals.json by matching trimmed name
      const baseChem = chemicalData.find(c => c.name.trim() === name.trim());
      if (!baseChem) {
        return res.status(404).json({ error: `Chemical '${name}' not found in source database.` });
      }
  
      // Create new entry, include chemicalId from chemicals.json
      const newEntry = new PersonalChemical({
        userId: req.user._id,
        userModel: req.userType === 'guest' ? 'Guest' : 'User',
        chemicalId: baseChem.id,       // <- add this field
        name: baseChem.name,
        formula: baseChem.formula,
        iupac: baseChem.iupac,
        quantity: quantity || '0'
      });
  
      await newEntry.save();

      await reportActivity({
        userId: req.user._id,
        source: 'personalDB',
        type: 'created',
        title: baseChem.name,
        link: `/personalDB.html`
      });

      return sendResponse(res, `Chemical '${name}' added`, newEntry._id);
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({ error: 'Chemical already in your personal set.' });
      }
      console.error('Add chemical error:', err);
      res.status(500).json({ error: 'Failed to add chemical.' });
    }
  };
  
  
  

// 3. Update quantity only
exports.updateChemicalQuantity = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  try {
    const chemical = await PersonalChemical.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { quantity },
      { new: true }
    );

    if (!chemical) {
      return res.status(404).json({ error: 'Chemical not found or not yours.' });
    }

    await reportActivity({
      userId: req.user._id,
      source: 'personalDB',
      type: 'updated',
      title: chemical.name,
      link: `/personalDB.html`
    });
    

    return sendResponse(res, `Chemical '${chemical.name}' updated`, chemical._id);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update chemical quantity.' });
  }
};

// 4. Delete a chemical
exports.deleteChemicalFromSet = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await PersonalChemical.findOneAndDelete({ _id: id, userId: req.user._id });

    if (!deleted) {
      return res.status(404).json({ error: 'Chemical not found or not yours.' });
    }

    return sendResponse(res, `Chemical '${deleted.name}' deleted`, deleted._id);
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete chemical.' });
  }
};

// 5. Create a chemical request
exports.createChemicalRequest = async (req, res) => {
  const { chemicalName } = req.body;

  try {
    const request = new Request({
      userId: req.user._id,
      userModel: req.userType === 'guest' ? 'Guest' : 'User',
      chemicalName: chemicalName.trim()
    });

    await request.save();
    return sendResponse(res, `Request for '${chemicalName}' submitted`, request._id);
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit request.' });
  }
};

// 6. Get current user's own requests
exports.getUserRequests = async (req, res) => {
  try {
    const requests = await Request.find({ userId: req.user._id });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch requests.' });
  }
};

// 7. Get all requests (admin only)
exports.getAllRequestsForAdmin = async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Access denied.' });
  }

  try {
    const requests = await Request.find().populate('userId', 'email name');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch requests.' });
  }
};

// 8. Approve a request
exports.approveRequest = async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Access denied.' });
  }

  const { id } = req.params;

  try {
    const updated = await Request.findByIdAndUpdate(id, { status: 'approved' }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Request not found.' });

    return sendResponse(res, `Request approved for '${updated.chemicalName}'`, updated._id);
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve request.' });
  }
};

// 9. Reject a request with optional feedback
exports.rejectRequest = async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Access denied.' });
  }

  const { id } = req.params;
  const { feedback } = req.body;

  try {
    const updated = await Request.findByIdAndUpdate(
      id,
      { status: 'rejected', feedback },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Request not found.' });

    return sendResponse(res, `Request rejected for '${updated.chemicalName}'`, updated._id);
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject request.' });
  }
};
