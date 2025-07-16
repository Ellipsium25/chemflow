const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const controller = require('../controllers/personalDBController');

router.use(auth);

// Personal Chemical Set Routes
router.get('/chemicals', controller.getUserChemicals);
router.post('/chemicals', controller.addChemicalToSet);
router.patch('/chemicals/:id', controller.updateChemicalQuantity);
router.delete('/chemicals/:id', controller.deleteChemicalFromSet);

// Chemical Request Routes (User)
router.post('/requests', controller.createChemicalRequest);
router.get('/requests', controller.getUserRequests);

// Admin Routes for Request Moderation
router.get('/admin/requests', controller.getAllRequestsForAdmin);
router.patch('/admin/requests/:id/approve', controller.approveRequest);
router.patch('/admin/requests/:id/reject', controller.rejectRequest);

module.exports = router;
