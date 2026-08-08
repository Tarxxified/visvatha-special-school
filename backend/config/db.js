// ============================================================
// DATABASE CONFIG — Supabase (Postgres)
// ------------------------------------------------------------
// Two separate clients, on purpose:
//
// 1. supabasePublic — uses the ANON key. This key is *meant* to be
//    public (Supabase's own docs say it's safe to expose in browser
//    code). It can only do what Row Level Security policies allow —
//    see supabase/schema.sql, which permits it to INSERT new
//    enquiries and nothing else. This is what the public "submit
//    enquiry" form uses.
//
// 2. supabaseAdmin — uses the SERVICE ROLE key. Full access, bypasses
//    RLS entirely. This must NEVER reach the browser. It's used only
//    for the admin-only operations (list/update/delete), which are
//    already gated by middleware/adminAuth.js before they ever reach
//    this file.
//
// Using the anon key for the public path (rather than the service key
// everywhere) means that even if the anon key ever leaks, the worst
// someone can do with it is submit fake enquiries — not read, edit,
// or delete real ones.
// ============================================================

const { createClient } = require('@supabase/supabase-js');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY || !process.env.SUPABASE_SERVICE_KEY) {
  console.error(
    '❌ Missing SUPABASE_URL, SUPABASE_ANON_KEY, or SUPABASE_SERVICE_KEY in .env — see .env.example.'
  );
}

const supabasePublic = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  { auth: { persistSession: false } }
);

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { persistSession: false } }
);

module.exports = { supabasePublic, supabaseAdmin };
