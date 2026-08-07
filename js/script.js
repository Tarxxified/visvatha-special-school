/* ============================================================
   VISVATHA SPECIAL SCHOOL — SCRIPT
   ------------------------------------------------------------
   1. Mobile nav toggle
   2. Sticky header shadow on scroll
   3. Active nav link highlight on scroll
   4. Scroll-reveal animation (respects prefers-reduced-motion)
   5. Stat counter animation
   6. Contact form validation + fake submit handler
   7. Footer year
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- 1. MOBILE NAV TOGGLE ---------- */
  var header = document.getElementById('siteHeader');
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');

  if (navToggle) {
    navToggle.addEventListener('click', function () {
      var isOpen = header.classList.toggle('mobile-open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen);
    });
  }

  // Close mobile menu when a link is tapped
  document.querySelectorAll('#navLinks a').forEach(function (link) {
    link.addEventListener('click', function () {
      header.classList.remove('mobile-open');
      navToggle.classList.remove('open');
    });
  });

  /* ---------- 2. STICKY HEADER SHADOW ---------- */
  function onScrollHeader() {
    if (window.scrollY > 12) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- 3. ACTIVE NAV LINK ON SCROLL ---------- */
  var sections = document.querySelectorAll('section[id]');
  var navAnchors = document.querySelectorAll('#navLinks a');

  function onScrollActiveNav() {
    var scrollPos = window.scrollY + 120;
    sections.forEach(function (sec) {
      var top = sec.offsetTop;
      var height = sec.offsetHeight;
      var id = sec.getAttribute('id');
      var link = document.querySelector('#navLinks a[href="#' + id + '"]');
      if (!link) return;
      if (scrollPos >= top && scrollPos < top + height) {
        navAnchors.forEach(function (a) { a.classList.remove('active'); });
        link.classList.add('active');
      }
    });
  }
  window.addEventListener('scroll', onScrollActiveNav, { passive: true });
  onScrollActiveNav();

  /* ---------- 4. SCROLL-REVEAL ANIMATION ---------- */
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealEls = document.querySelectorAll('.reveal');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- 5. STAT COUNTER (for numeric stats only) ---------- */
  // Numbers like "1:1", "Jun", "100%" stay static; purely numeric ones could be animated here if added later.

  /* ---------- 6. CONTACT FORM ---------- */
  var form = document.getElementById('enquiryForm');
  var status = document.getElementById('formStatus');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var phone = form.phone.value.trim();
      var email = form.email.value.trim();
      var phoneOk = /^[0-9+\-\s]{7,15}$/.test(phone);
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!form.checkValidity() || !phoneOk || !emailOk) {
        status.textContent = 'Please check the highlighted fields — phone and email should be valid.';
        status.className = 'error';
        form.reportValidity();
        return;
      }

      // NOTE: This is a front-end-only demo. To actually receive these enquiries by email,
      // connect this form to a service like Formspree/EmailJS, or your own backend endpoint,
      // then replace this block with a real fetch() call. See README.md for instructions.
      status.textContent = 'Thank you! Your enquiry has been noted. We will get back to you within a day.';
      status.className = 'success';
      form.reset();
    });
  }

  /* ---------- 7. FOOTER YEAR ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

});
