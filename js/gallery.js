/* ============================================================
   GALLERY PAGE — SCRIPT
   ------------------------------------------------------------
   1. Category filtering (All / Classroom / Activities / etc.)
   2. Lightbox: click a photo to view it large, arrow through others
   ------------------------------------------------------------
   Kept separate from js/script.js so the homepage's script is
   never at risk of breaking — this file only runs on gallery.html.
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  var filterBar = document.getElementById('filterBar');
  var galleryItems = Array.prototype.slice.call(document.querySelectorAll('.gallery-item'));
  var galleryEmpty = document.getElementById('galleryEmpty');

  /* ---------- 1. CATEGORY FILTERING ---------- */
  if (filterBar) {
    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter-btn');
      if (!btn) return;

      filterBar.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');

      var filter = btn.getAttribute('data-filter');
      var visibleCount = 0;

      galleryItems.forEach(function (item) {
        var matches = filter === 'all' || item.getAttribute('data-category') === filter;
        item.classList.toggle('gallery-hidden', !matches);
        if (matches) visibleCount++;
      });

      if (galleryEmpty) galleryEmpty.classList.toggle('hidden', visibleCount > 0);

      // Rebuild the lightbox's photo list to match what's currently visible,
      // so prev/next only cycles through photos actually on screen.
      buildVisiblePhotoList();
    });
  }

  /* ---------- 2. LIGHTBOX ---------- */
  var overlay = document.getElementById('lightboxOverlay');
  var lightboxImage = document.getElementById('lightboxImage');
  var closeBtn = document.getElementById('lightboxClose');
  var prevBtn = document.getElementById('lightboxPrev');
  var nextBtn = document.getElementById('lightboxNext');

  var visiblePhotos = [];
  var currentIndex = 0;

  function buildVisiblePhotoList() {
    visiblePhotos = galleryItems
      .filter(function (item) { return !item.classList.contains('gallery-hidden'); })
      .map(function (item) { return item.querySelector('img'); });
  }
  buildVisiblePhotoList();

  function openLightbox(img) {
    currentIndex = visiblePhotos.indexOf(img);
    if (currentIndex === -1) currentIndex = 0;
    showCurrent();
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden'; // stop background scroll while open
  }

  function showCurrent() {
    var img = visiblePhotos[currentIndex];
    if (!img) return;
    lightboxImage.src = img.src;
    lightboxImage.alt = img.alt;
  }

  function closeLightbox() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % visiblePhotos.length;
    showCurrent();
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + visiblePhotos.length) % visiblePhotos.length;
    showCurrent();
  }

  galleryItems.forEach(function (item) {
    item.addEventListener('click', function () {
      openLightbox(item.querySelector('img'));
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (nextBtn) nextBtn.addEventListener('click', showNext);
  if (prevBtn) prevBtn.addEventListener('click', showPrev);

  // Click the dark background (not the image itself) to close
  if (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeLightbox();
    });
  }

  // Keyboard support: Escape closes, arrow keys navigate
  document.addEventListener('keydown', function (e) {
    if (!overlay || !overlay.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
  });

});
