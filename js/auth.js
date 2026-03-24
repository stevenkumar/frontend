const API_BASE = 'http://127.0.0.1:5000/api/auth';

// ===== Tab Switching =====
function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
  document.getElementById(`tab-${tab}`).classList.add('active');
  document.getElementById(`form-${tab}`).classList.add('active');
  clearAlerts();
}

function clearAlerts() {
  document.querySelectorAll('.alert').forEach(a => a.classList.remove('show'));
}

function showAlert(formId, type, message) {
  const el = document.getElementById(`${formId}-${type}`);
  el.querySelector('span').textContent = message;
  el.classList.add('show');
}

// ===== Toggle Password Visibility =====
function togglePassword(id) {
  const input = document.getElementById(id);
  const icon = input.nextElementSibling;
  if (input.type === 'password') {
    input.type = 'text';
    icon.className = 'pwd-toggle fas fa-eye-slash';
  } else {
    input.type = 'password';
    icon.className = 'pwd-toggle fas fa-eye';
  }
}

// ===== Register =====
async function handleRegister(e) {
  e.preventDefault();
  clearAlerts();
  const btn = document.getElementById('register-btn');
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const confirm = document.getElementById('reg-confirm').value;

  if (password !== confirm) {
    return showAlert('register', 'error', 'Passwords do not match.');
  }

  btn.disabled = true;
  btn.textContent = 'Creating Account...';

  try {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();

    if (!res.ok) {
      showAlert('register', 'error', data.message || 'Registration failed.');
    } else {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      showAlert('register', 'success', `Welcome, ${data.user.name}! Redirecting...`);
      setTimeout(() => window.location.href = 'index.html', 1500);
    }
  } catch (err) {
    showAlert('register', 'error', 'Cannot connect to server. Make sure the backend is running.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Create Account';
  }
}

// ===== Login =====
async function handleLogin(e) {
  e.preventDefault();
  clearAlerts();
  const btn = document.getElementById('login-btn');
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  btn.disabled = true;
  btn.textContent = 'Signing In...';

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (!res.ok) {
      showAlert('login', 'error', data.message || 'Login failed.');
    } else {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      showAlert('login', 'success', `${data.message} Redirecting...`);
      setTimeout(() => window.location.href = 'index.html', 1500);
    }
  } catch (err) {
    showAlert('login', 'error', 'Cannot connect to server. Make sure the backend is running.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Sign In';
  }
}

// ===== Init: check if already logged in =====
window.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (token) window.location.href = 'index.html';
});
