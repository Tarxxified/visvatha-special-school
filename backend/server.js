// ============================================================
// VISVATHA SPECIAL SCHOOL — BACKEND SERVER
// ------------------------------------------------------------
// Run with:  npm install   then   npm run dev  (or npm start)
// ============================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// EDIT: this path matches your current layout — backend/routes/enquiryRoutes.js
const enquiryRoutes = require('./routes/enquiryRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ---- Middleware ----
app.use(cors({
  origin: process.env.CORS_ORIGIN && process.env.CORS_ORIGIN !== '*'
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : '*',
}));
app.use(express.json());

// ---- Static admin dashboard (plain HTML/CSS/JS, no build step) ----
// EDIT: this matches your "notifications" > "Admin" folder. Using path.join
// with separate arguments (not a literal backslash string) so it works the
// same on Windows, Mac, and Linux.
app.use('/admin', express.static(path.join(__dirname, 'notifications', 'Admin')));

// ---- API routes ----
app.use('/api/enquiries', enquiryRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ---- 404 fallback for unknown API routes ----
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

// ---- Central error handler ----
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on our end.' });
});

app.listen(PORT, () => {
  console.log(`\n✅ Visvatha backend running at http://localhost:${PORT}`);
  console.log(`   Admin dashboard: http://localhost:${PORT}/admin`);
  console.log(`   Enquiry API:     http://localhost:${PORT}/api/enquiries\n`);
});