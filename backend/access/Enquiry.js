// ============================================================
// ENQUIRY MODEL — Supabase (Postgres) version
// ------------------------------------------------------------
// createEnquiry() uses the anon-key client — RLS policies in
// supabase/schema.sql only let it INSERT, nothing else.
// Every other function uses the service-role client, and is only
// ever reached through admin-only routes (see middleware/adminAuth.js).
//
// Same exported functions and same shape of data going in/out as
// before, so controllers/routes/the admin dashboard don't need to
// change when the underlying client changes.
// ============================================================

const { supabasePublic, supabaseAdmin } = require('../config/db');

const TABLE = 'enquiries';

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

// Converts a Postgres row (snake_case) to the app's camelCase shape.
function mapRow(row) {
  if (!row) return null;
  return {
    _id: row.id,
    parentName: row.parent_name,
    childAge: row.child_age,
    phone: row.phone,
    email: row.email,
    interest: row.interest,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// PUBLIC — uses the anon-key client. RLS only allows INSERT for this role.
async function createEnquiry(data) {
  const row = {
    parent_name: data.parentName.trim(),
    child_age: Number(data.childAge),
    phone: data.phone.trim(),
    email: data.email.trim().toLowerCase(),
    interest: data.interest,
    message: (data.message || '').trim(),
    status: 'new',
  };

  const { error } = await supabasePublic
  .from(TABLE)
  .insert(row);

if (error) throw error;

return null;
}

// ADMIN ONLY (reached via adminAuth middleware) — uses the service-role client.
async function getAllEnquiries({ status } = {}) {
  let query = supabaseAdmin.from(TABLE).select('*').order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) throw error;
  return data.map(mapRow);
}

async function getEnquiryById(id) {
  const { data, error } = await supabaseAdmin.from(TABLE).select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return mapRow(data);
}

async function updateEnquiryStatus(id, status) {
  if (!ALLOWED_STATUSES.includes(status)) {
    throw new Error(`Status must be one of: ${ALLOWED_STATUSES.join(', ')}`);
  }

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) throw error;
  return mapRow(data);
}

async function deleteEnquiry(id) {
  const { data, error } = await supabaseAdmin.from(TABLE).delete().eq('id', id).select();
  if (error) throw error;
  return data.length > 0;
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
