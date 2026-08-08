// ============================================================
// ENQUIRY MODEL
// ------------------------------------------------------------
// Plain functions wrapping the datastore — kept deliberately simple.
// Valid statuses move an enquiry through a lifecycle as staff work it:
//   new -> contacted -> enrolled   (or) -> closed
// ============================================================

const { enquiriesDb } = require('../config/db');

const ALLOWED_STATUSES = ['new', 'contacted', 'enrolled', 'closed'];
const ALLOWED_PROGRAMS = [
  'Special Education',
  'Speech & Language Therapy',
  'Occupational Therapy',
  'Life & Social Skills',
  'Vocational Training',
  'General Enquiry / School Visit',
];

function validateEnquiry(data = {}) {
  const errors = [];

  if (!data.parentName || !data.parentName.trim()) {
    errors.push('Parent/guardian name is required.');
  }
  if (data.childAge === undefined || data.childAge === null || data.childAge === '' ||
      isNaN(Number(data.childAge)) || Number(data.childAge) < 1 || Number(data.childAge) > 18) {
    errors.push('Child age must be a number between 1 and 18.');
  }
  if (!data.phone || !/^[0-9+\-\s]{7,15}$/.test(data.phone.trim())) {
    errors.push('A valid phone number is required.');
  }
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.push('A valid email address is required.');
  }
  if (!data.interest || !ALLOWED_PROGRAMS.includes(data.interest)) {
    errors.push('Please select a valid program of interest.');
  }
  if (data.message && data.message.length > 2000) {
    errors.push('Message is too long (max 2000 characters).');
  }

  return errors;
}

async function createEnquiry(data) {
  const enquiry = {
    parentName: data.parentName.trim(),
    childAge: Number(data.childAge),
    phone: data.phone.trim(),
    email: data.email.trim().toLowerCase(),
    interest: data.interest,
    message: (data.message || '').trim(),
    status: 'new',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return enquiriesDb.insert(enquiry);
}

async function getAllEnquiries({ status } = {}) {
  const query = status ? { status } : {};
  return enquiriesDb.find(query).sort({ createdAt: -1 });
}

async function getEnquiryById(id) {
  return enquiriesDb.findOne({ _id: id });
}

async function updateEnquiryStatus(id, status) {
  if (!ALLOWED_STATUSES.includes(status)) {
    throw new Error(`Status must be one of: ${ALLOWED_STATUSES.join(', ')}`);
  }
  await enquiriesDb.update({ _id: id }, { $set: { status, updatedAt: new Date().toISOString() } });
  return getEnquiryById(id);
}

async function deleteEnquiry(id) {
  const removed = await enquiriesDb.remove({ _id: id });
  return removed > 0;
}

module.exports = {
  ALLOWED_STATUSES,
  ALLOWED_PROGRAMS,
  validateEnquiry,
  createEnquiry,
  getAllEnquiries,
  getEnquiryById,
  updateEnquiryStatus,
  deleteEnquiry,
};
