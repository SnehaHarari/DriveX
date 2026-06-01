// ── Auth helpers ──────────────────────────────────────────────
function getToken() { return localStorage.getItem('token'); }
function getUser() { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } }
function isLoggedIn() { return !!getToken(); }
function isAdmin() { return getUser()?.role === 'admin'; }

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}

// ── API helper ────────────────────────────────────────────────
async function api(path, options = {}) {
  const token = getToken();
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Something went wrong.');
  return data;
}

// ── Toast ─────────────────────────────────────────────────────
function toast(msg, type = 'success') {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.className = `show ${type}`;
  setTimeout(() => { el.className = ''; }, 3500);
}

// ── Navbar: inject nav and highlight active link ──────────────
function renderNav() {
  const user = getUser();
  const nav = document.querySelector('.nav-actions');
  if (!nav) return;

  if (user) {
    nav.innerHTML = `
      <span style="color: var(--muted); font-size:13px">Hi, ${user.name.split(' ')[0]}</span>
      ${user.role === 'admin' ? `<a href="/admin" class="btn btn-outline btn-sm">Admin</a>` : ''}
      <a href="/bookings" class="btn btn-outline btn-sm">My Bookings</a>
      <button class="btn btn-primary btn-sm" onclick="logout()">Logout</button>
    `;
  } else {
    nav.innerHTML = `
      <a href="/login" class="btn btn-outline btn-sm">Login</a>
      <a href="/register" class="btn btn-primary btn-sm">Register</a>
    `;
  }

  // Highlight active link
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.href === location.href) a.classList.add('active');
  });
}

document.addEventListener('DOMContentLoaded', renderNav);