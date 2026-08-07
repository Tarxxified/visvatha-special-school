# Visvatha Special School — Website

A clean, warm, one-page website built with plain **HTML, CSS and JavaScript** — no frameworks, no build tools. Open the folder in VS Code and start editing.

## Files

```
visvatha-website/
├── index.html      ← all page content and structure
├── css/style.css   ← all styling (colors, fonts, layout, responsive rules)
├── js/script.js    ← mobile menu, scroll effects, form handling
└── images/         ← put your real photos/logo here
```

## How to view it

Just double-click `index.html` to open it in a browser — or in VS Code, install the **"Live Server"** extension, right-click `index.html` → **"Open with Live Server"**. That gives you auto-refresh while you edit.

## Things you'll want to personalize first

Search for `EDIT:` comments in `index.html` — they mark every spot using placeholder content:

1. **Logo** — currently an SVG placeholder in the header/footer. Replace with your real logo:
   ```html
   <img src="images/logo.png" class="brand-mark" alt="Visvatha Special School logo">
   ```
2. **Phone number & email** — search for `+91 00000 00000` and `info@visvathaschool.com` and replace throughout.
3. **Address & map** — the embedded map currently just searches "Korattur, Chennai". For your exact location:
   - Go to Google Maps → find your school → Share → Embed a map → copy the `src` URL
   - Paste it into the `<iframe src="...">` in the Contact section.
4. **Stats strip** — the four numbers near the top (1:1, Jun, 6+, 100%) are placeholders. Swap in real figures once you have them (year founded, number of students, staff, etc.).
5. **Testimonials** — three sample parent quotes are included as placeholders. Replace with real (permission-given) parent feedback.
6. **Social links** — the footer Instagram/Facebook/YouTube icons currently link to `#`. Add your real profile URLs.
7. **Photos** — right now the hero and about sections use original SVG illustrations instead of photos (so the site works immediately with no missing images). Feel free to swap any section for real photos of the school/classrooms — drop files into `images/` and reference them like `images/classroom-1.jpg`.

## Making the contact form actually send emails

Right now the form validates input and shows a "Thank you" message, but it doesn't send anywhere — there's no backend. Easiest options, in order of simplicity:

**Option A — Formspree (no code, free tier available)**
1. Create a free account at [formspree.io](https://formspree.io) and create a new form to get an endpoint URL like `https://formspree.io/f/xxxxxxx`.
2. In `index.html`, change the form tag to:
   ```html
   <form id="enquiryForm" action="https://formspree.io/f/xxxxxxx" method="POST">
   ```
3. In `js/script.js`, remove the `e.preventDefault();` line inside the submit handler (or replace the whole handler) so the browser submits normally to Formspree.

**Option B — EmailJS (no backend, sends via your own email account)**
Follow [emailjs.com](https://www.emailjs.com) docs to send the form fields directly from JavaScript using their SDK — good if you want the "Thank you" message to stay exactly as-is.

**Option C — Your own backend**
If you're comfortable with a small Node/Express (or PHP) endpoint, replace the placeholder logic in `js/script.js`'s submit handler with a `fetch()` call to your endpoint, e.g.:
```js
fetch('/api/enquiry', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(Object.fromEntries(new FormData(form)))
});
```

## Adding more pages

This is currently a single scrolling page with anchor navigation (`#about`, `#programs`, etc.) — the same pattern used by most small school sites, and easiest to maintain. If you'd rather split it into separate pages (e.g. `about.html`, `programs.html`), copy the header/footer markup into each new file and move the relevant `<section>` into its own page — the shared `css/style.css` and `js/script.js` will keep working across all of them without changes.

## Deploying it live

Once you're happy with it, you can host this for free on:
- **Netlify** or **Vercel** — drag-and-drop the folder, done.
- **GitHub Pages** — push the folder to a GitHub repo, enable Pages in settings.

Then point your domain (or a free subdomain) at it.

## Design notes

- **Colors** are all defined once at the top of `css/style.css` under `:root { ... }` — change a hex value there and it updates everywhere.
- **Fonts**: Fredoka (rounded, friendly — headings) + Karla (clean, readable — body text), loaded from Google Fonts.
- The site respects `prefers-reduced-motion` for visitors sensitive to animation.
