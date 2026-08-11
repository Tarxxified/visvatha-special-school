const express = require('express');
const router = express.Router();

// EDIT: paths matched to your current layout —
// backend/controllers/enquiryController.js
// backend/handling logic/middleware/adminAuth.js
const ctrl = require('../controllers/enquiryController');
const adminAuth = require('../handling logic/middleware/adminAuth');

// Public — the website's contact form posts here
router.post('/', ctrl.submitEnquiry);

// Admin only — viewing & managing enquiries
router.get('/', adminAuth, ctrl.listEnquiries);
router.get('/:id', adminAuth, ctrl.getEnquiry);
router.patch('/:id/status', adminAuth, ctrl.updateStatus);
router.delete('/:id', adminAuth, ctrl.removeEnquiry);

module.exports = router;