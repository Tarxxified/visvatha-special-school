// ============================================================
// ENQUIRY CONTROLLER
// ------------------------------------------------------------
// Handles the request/response side; delegates data logic to the model.
//
// NOTE: email notifications on new enquiries were left out here on
// purpose — that depended on a utils/mailer.js file which doesn't
// exist yet in this folder layout, and we've hit enough
// "requiring an empty/missing file" crashes for one day. Enquiries
// still save to Supabase fine without it. If you want an email ping
// on new enquiries later, say so and I'll add utils/mailer.js back in.
// ============================================================

// EDIT: matches your current layout — backend/access/Enquiry.js
const Enquiry = require('../access/Enquiry');

// POST /api/enquiries  — public, called from the website's contact form
async function submitEnquiry(req, res) {
  const errors = Enquiry.validateEnquiry(req.body);
  if (errors.length) {
    return res.status(400).json({ errors });
  }

  try {
    const saved = await Enquiry.createEnquiry(req.body);
    res.status(201).json({
      message: 'Thank you! Your enquiry has been received. We will get back to you within a day.',
      enquiry: saved,
    });
  } catch (err) {
    console.error('Failed to save enquiry:', err);
    res.status(500).json({ error: 'Something went wrong saving your enquiry. Please try again or call us directly.' });
  }
}

// GET /api/enquiries?status=new  — admin only
async function listEnquiries(req, res) {
  try {
    const { status } = req.query;
    const enquiries = await Enquiry.getAllEnquiries({ status });
    res.json(enquiries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch enquiries.' });
  }
}

// GET /api/enquiries/:id  — admin only
async function getEnquiry(req, res) {
  try {
    const enquiry = await Enquiry.getEnquiryById(req.params.id);
    if (!enquiry) return res.status(404).json({ error: 'Enquiry not found.' });
    res.json(enquiry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch enquiry.' });
  }
}

// PATCH /api/enquiries/:id/status  — admin only, body: { status }
async function updateStatus(req, res) {
  try {
    const updated = await Enquiry.updateEnquiryStatus(req.params.id, req.body.status);
    if (!updated) return res.status(404).json({ error: 'Enquiry not found.' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// DELETE /api/enquiries/:id  — admin only
async function removeEnquiry(req, res) {
  try {
    const deleted = await Enquiry.deleteEnquiry(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Enquiry not found.' });
    res.json({ message: 'Enquiry deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not delete enquiry.' });
  }
}

module.exports = { submitEnquiry, listEnquiries, getEnquiry, updateStatus, removeEnquiry };