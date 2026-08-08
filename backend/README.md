# Visvatha Backend — Enquiry API + Admin Dashboard

A small Node.js/Express API that receives enquiry form submissions from the website, stores them in Supabase (Postgres), optionally emails staff when one comes in, and gives you a simple password-protected dashboard to view and manage them.

## Folder structure

```
backend/
├── server.js               ← app entry point
├── config/db.js            ← Supabase client setup
├── models/Enquiry.js        ← validation + data access
├── controllers/enquiryController.js  ← request handling logic
├── routes/enquiryRoutes.js  ← API endpoints
├── middleware/adminAuth.js  ← protects admin-only routes
├── utils/mailer.js          ← optional email notifications
├── admin/                   ← static admin dashboard (HTML/CSS/JS)
├── supabase/schema.sql      ← run once in Supabase to create the table
├── .env.example             ← copy to .env and fill in
└── package.json
```

## 1. Set up the database table

In your Supabase project dashboard: **SQL Editor → New query**, paste the contents of `supabase/schema.sql`, and run it. This creates the `enquiries` table with the right columns, indexes, and Row Level Security enabled (see the comments in that file for why).

## 2. Install & run

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in:
- `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` — both from your Supabase project's **Settings → API** page. Use the **service_role** key, not the anon key — the .env.example file explains why.
- `ADMIN_KEY` — any long random string, this is your admin password for the dashboard.

```bash
npm run dev
```

You should see:
```
✅ Visvatha backend running at http://localhost:5000
   Admin dashboard: http://localhost:5000/admin
   Enquiry API:     http://localhost:5000/api/enquiries
```

## 2. Connect the website form to it

The frontend (`../js/script.js`) already points at `http://localhost:5000/api/enquiries` by default — so as long as the backend is running, the "Send Enquiry" form on the website will work immediately in local development.

When you're ready to go live, you'll run the backend somewhere (see **Deploying**, below) and then update the `API_URL` constant near the top of `js/script.js` to that live address.

## 3. View & manage enquiries

Go to **http://localhost:5000/admin**, enter the `ADMIN_KEY` from your `.env`, and you'll see every enquiry — newest first. Click one to see full details, change its status (`new → contacted → enrolled/closed`), or delete it.

You can also browse/edit the raw data directly in Supabase's own **Table Editor** if you ever need to — both views work off the same table.

The admin key is just kept in the browser's session storage — closing the tab logs you out. There's no separate login system with usernames, which keeps things simple for a single-admin school office. If several staff need their own logins later, that's a bigger upgrade (see note in `middleware/adminAuth.js`).

## 4. API reference

| Method | Endpoint                      | Auth   | Purpose                          |
|--------|--------------------------------|--------|-----------------------------------|
| POST   | `/api/enquiries`               | Public | Submit a new enquiry              |
| GET    | `/api/enquiries`                | Admin  | List all enquiries (optionally `?status=new`) |
| GET    | `/api/enquiries/:id`            | Admin  | Get one enquiry                   |
| PATCH  | `/api/enquiries/:id/status`     | Admin  | Update status — body `{ "status": "contacted" }` |
| DELETE | `/api/enquiries/:id`            | Admin  | Delete an enquiry                 |
| GET    | `/api/health`                   | Public | Health check                      |

Admin routes require a header: `x-admin-key: <your ADMIN_KEY>`

Quick test with curl:
```bash
# Submit an enquiry (what the website form does)
curl -X POST http://localhost:5000/api/enquiries \
  -H "Content-Type: application/json" \
  -d '{"parentName":"Test Parent","childAge":6,"phone":"9876543210","email":"test@example.com","interest":"Special Education","message":"Just testing"}'

# List enquiries (replace YOUR_ADMIN_KEY)
curl http://localhost:5000/api/enquiries -H "x-admin-key: YOUR_ADMIN_KEY"
```

## 5. Optional: email notifications

By default, enquiries are saved but no email is sent — the site still works fully without this. To get an email the moment someone submits the form, fill in the SMTP section of `.env`:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
NOTIFY_EMAIL=admissions@visvathaschool.com
```

For Gmail, you need an **App Password** (not your regular password): https://myaccount.google.com/apppasswords — this requires 2-factor authentication to be enabled on the account first.

## 6. CORS (if the form and backend are on different domains)

By default `CORS_ORIGIN=*` in `.env` allows requests from anywhere — fine for local development. Before going live, set it to your real website domain so random other sites can't submit to your API:
```
CORS_ORIGIN=https://visvathaschool.com
```

## 7. Deploying the backend

Unlike the static frontend (which can go on Netlify/Vercel/GitHub Pages), this backend needs somewhere that runs Node.js continuously. Good free/cheap options:
- **Render** (render.com) — connect your GitHub repo, it auto-deploys on push, has a free tier.
- **Railway** (railway.app) — similarly simple, usage-based free tier.
- **Fly.io** — a bit more setup, generous free tier.

Whichever you pick: set the same environment variables from `.env` in their dashboard (never commit your real `.env` file), then update `API_URL` in the frontend's `js/script.js` to point at the deployed URL.

## 8. Growing beyond this later

The code is structured (config/models/controllers/routes) so most future needs are additions, not rewrites:
- **Multiple staff logins** → replace `middleware/adminAuth.js` with real user accounts. Supabase Auth is a natural fit here since you're already on Supabase — it handles login, password resets, etc. for you.
- **File uploads** (e.g. medical reports with an enquiry) → Supabase Storage pairs well with the existing setup; add a `documents` bucket and store the file URL alongside the enquiry row.
- **Reporting/analytics** → since the data now lives in real Postgres, you can write SQL views or connect a BI tool directly to Supabase if the school ever wants dashboards beyond the simple admin page.
