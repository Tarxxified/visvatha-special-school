// ============================================================
// ADMIN AUTH MIDDLEWARE
// ------------------------------------------------------------
// Simple shared-secret auth: requests must include a header
//   x-admin-key: <ADMIN_KEY from .env>
// Good enough for a single-admin school office.
// ============================================================

module.exports = function adminAuth(req, res, next) {
  if (!process.env.ADMIN_KEY) {
    return res.status(500).json({ error: 'Server misconfigured: ADMIN_KEY is not set in .env.' });
  }

  const providedKey = req.header('x-admin-key');
  if (!providedKey || providedKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized. Provide a valid x-admin-key header.' });
  }

  next();
};