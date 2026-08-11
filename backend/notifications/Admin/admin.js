// ============================================================
// ADMIN DASHBOARD LOGIC
// ------------------------------------------------------------
// Talks to the same server this page is served from (relative /api
// path), so no base URL configuration is needed here.
// ============================================================

const API_BASE = '/api/enquiries';
const KEY_STORAGE = 'visvatha_admin_key';

const loginGate = document.getElementById('loginGate');
const dashboard = document.getElementById('dashboard');
const adminKeyInput = document.getElementById('adminKeyInput');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const refreshBtn = document.getElementById('refreshBtn');
const statusFilter = document.getElementById('statusFilter');
const enquiryList = document.getElementById('enquiryList');
const enquiryCount = document.getElementById('enquiryCount');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const emptyState = document.getElementById('emptyState');
const modalOverlay = document.getElementById('modalOverlay');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');

function getKey() { return sessionStorage.getItem(KEY_STORAGE); }
function setKey(key) { sessionStorage.setItem(KEY_STORAGE, key); }
function clearKey() { sessionStorage.removeItem(KEY_STORAGE); }

function showDashboard() {
  loginGate.classList.add('hidden');
  dashboard.classList.remove('hidden');
  loadEnquiries();
}
function showLogin(message) {
  dashboard.classList.add('hidden');
  loginGate.classList.remove('hidden');
  if (message) loginError.textContent = message;
}

async function apiFetch(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': getKey() || '',
      ...(options.headers || {}),
    },
  });
  if (res.status === 401) {
    clearKey();
    showLogin('Session expired or invalid key — please log in again.');
    throw new Error('Unauthorized');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

// ---- Login ----
loginBtn.addEventListener('click', async () => {
  const key = adminKeyInput.value.trim();
  if (!key) { loginError.textContent = 'Please enter your admin key.'; return; }
  setKey(key);
  loginError.textContent = '';
  try {
    await apiFetch('');
    showDashboard();
  } catch (err) {
    clearKey();
    loginError.textContent = 'Invalid admin key. Check backend/.env and try again.';
  }
});
adminKeyInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') loginBtn.click(); });

logoutBtn.addEventListener('click', () => {
  clearKey();
  adminKeyInput.value = '';
  showLogin('');
});

// ---- Load & render list ----
async function loadEnquiries() {
  loadingState.classList.remove('hidden');
  errorState.classList.add('hidden');
  emptyState.classList.add('hidden');
  enquiryList.innerHTML = '';

  try {
    const status = statusFilter.value;
    const data = await apiFetch(status ? `?status=${encodeURIComponent(status)}` : '');
    loadingState.classList.add('hidden');

    enquiryCount.textContent = `${data.length} enquir${data.length === 1 ? 'y' : 'ies'}`;

    if (data.length === 0) {
      emptyState.classList.remove('hidden');
      return;
    }

    data.forEach((enq) => enquiryList.appendChild(renderCard(enq)));
  } catch (err) {
    loadingState.classList.add('hidden');
    if (err.message !== 'Unauthorized') {
      errorState.textContent = err.message || 'Could not load enquiries.';
      errorState.classList.remove('hidden');
    }
  }
}

function renderCard(enq) {
  const card = document.createElement('div');
  card.className = `enquiry-card status-${enq.status}`;
  card.innerHTML = `
    <div class="ec-main">
      <strong>${escapeHtml(enq.parentName)}</strong>
      <span>${escapeHtml(enq.interest)} · Child age ${escapeHtml(String(enq.childAge))} · ${escapeHtml(enq.phone)}</span>
    </div>
    <div class="ec-meta">
      <span class="badge status-${enq.status}">${enq.status}</span>
      <span class="ec-date">${formatDate(enq.createdAt)}</span>
    </div>
  `;
  card.addEventListener('click', () => openDetail(enq));
  return card;
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) +
         ' · ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---- Detail modal ----
function openDetail(enq) {
  modalBody.innerHTML = `
    <h2>${escapeHtml(enq.parentName)}</h2>
    <div class="detail-row"><span class="label">Child's Age</span><span class="value">${escapeHtml(String(enq.childAge))}</span></div>
    <div class="detail-row"><span class="label">Phone</span><span class="value"><a href="tel:${escapeHtml(enq.phone)}">${escapeHtml(enq.phone)}</a></span></div>
    <div class="detail-row"><span class="label">Email</span><span class="value"><a href="mailto:${escapeHtml(enq.email)}">${escapeHtml(enq.email)}</a></span></div>
    <div class="detail-row"><span class="label">Interested In</span><span class="value">${escapeHtml(enq.interest)}</span></div>
    <div class="detail-row"><span class="label">Received</span><span class="value">${formatDate(enq.createdAt)}</span></div>
    ${enq.message ? `<div class="modal-message">${escapeHtml(enq.message)}</div>` : ''}
    <div class="modal-actions">
      <select class="status-select" id="statusSelect">
        ${['new','contacted','enrolled','closed'].map(s =>
          `<option value="${s}" ${s === enq.status ? 'selected' : ''}>${s[0].toUpperCase()+s.slice(1)}</option>`
        ).join('')}
      </select>
      <button class="btn btn-small" id="saveStatusBtn">Save Status</button>
      <button class="btn btn-danger btn-small" id="deleteBtn">Delete</button>
    </div>
  `;
  modalOverlay.classList.remove('hidden');

  document.getElementById('saveStatusBtn').addEventListener('click', async () => {
    const newStatus = document.getElementById('statusSelect').value;
    try {
      await apiFetch(`/${enq._id}/status`, { method: 'PATCH', body: JSON.stringify({ status: newStatus }) });
      closeModal();
      loadEnquiries();
    } catch (err) {
      alert(err.message || 'Could not update status.');
    }
  });

  document.getElementById('deleteBtn').addEventListener('click', async () => {
    if (!confirm(`Delete the enquiry from ${enq.parentName}? This can't be undone.`)) return;
    try {
      await apiFetch(`/${enq._id}`, { method: 'DELETE' });
      closeModal();
      loadEnquiries();
    } catch (err) {
      alert(err.message || 'Could not delete enquiry.');
    }
  });
}

function closeModal() { modalOverlay.classList.add('hidden'); }
modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });

// ---- Filter / refresh ----
statusFilter.addEventListener('change', loadEnquiries);
refreshBtn.addEventListener('click', loadEnquiries);

// ---- Boot ----
if (getKey()) { showDashboard(); } else { showLogin(); }
