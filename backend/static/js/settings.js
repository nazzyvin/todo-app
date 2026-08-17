const API = '/api';

// Redirect to login if no token
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = '/login/';
}

// Set avatar
const username = localStorage.getItem('username');
if (username) {
    document.getElementById('avatar-initial').textContent = username[0].toUpperCase();
    document.getElementById('avatar-username').textContent = username;
    document.getElementById('new-username').placeholder = `Current: ${username}`;
}

// Logout
document.getElementById('logout-btn').addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = '/login/';
});

// Helper to show messages
function showMsg(elId, message, success = true) {
    const el = document.getElementById(elId);
    el.textContent = message;
    el.className = `small mb-2 ${success ? 'text-success' : 'text-danger'}`;
    el.classList.remove('d-none');
    setTimeout(() => el.classList.add('d-none'), 3000);
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('app-toast');
    const toastMsg = document.getElementById('toast-message');
    toastMsg.textContent = message;
    toast.className = `toast align-items-center border-0 text-white bg-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'primary'}`;
    const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
    bsToast.show();
}

// Change username
document.getElementById('update-username-btn').addEventListener('click', async function() {
    const newUsername = document.getElementById('new-username').value.trim();
    if (!newUsername) return showMsg('username-msg', 'Please enter a username', false);

    const res = await fetch(`${API}/auth/update/`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
        },
        body: JSON.stringify({ username: newUsername })
    });

    if (res.ok) {
        localStorage.setItem('username', newUsername);
        document.getElementById('avatar-initial').textContent = newUsername[0].toUpperCase();
        document.getElementById('avatar-username').textContent = newUsername;
        document.getElementById('new-username').value = '';
        document.getElementById('new-username').placeholder = `Current: ${newUsername}`
        showToast('Username updated successfully!');
    } else {
        const data = await res.json();
        showToast(data.error || 'Failed to update username', 'error');
    }
});

// Change password
document.getElementById('update-password-btn').addEventListener('click', async function() {
    const currentPassword = document.getElementById('current-password').value.trim();
    const newPassword = document.getElementById('new-password').value.trim();

    if (!currentPassword || !newPassword) return showMsg('password-msg', 'Please fill in both fields', false);

    const currentToken = localStorage.getItem('token');

    const res = await fetch(`${API}/auth/update/`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${currentToken}`
        },
        body: JSON.stringify({ password: currentPassword, new_password: newPassword })
    });

   if (res.ok) {
        const data = await res.json();
        if (data.token) {
            localStorage.setItem('token', data.token);
        }
        document.getElementById('current-password').value = '';
        document.getElementById('new-password').value = '';
        showToast('Password updated successfully!');
        
    } else {
        const data = await res.json();
        showToast(data.error || 'Failed to update password', 'error');
    }
});

// Delete account
// Delete account
document.getElementById('delete-account-btn').addEventListener('click', async function() {
    if (!confirm('Are you sure? This will permanently delete your account and all your data.')) return;

    const currentToken = localStorage.getItem('token');  // ← read fresh token

    const res = await fetch(`${API}/auth/delete/`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Token ${currentToken}`  // ← use fresh token
        }
    });

    if (res.ok) {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        window.location.href = '/login/';
    } else {
        alert('Failed to delete account. Please try again.');
    }
});

/* =========================
    MOBILE SIDEBAR TOGGLE
=========================*/
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebar = document.querySelector('.sidebar');
const overlay = document.getElementById('sidebar-overlay');

if (sidebarToggle) {
    sidebarToggle.addEventListener('click', function () {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('show');
    });

    overlay.addEventListener('click', function () {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
    });
}

// Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/static/js/service-worker.js')
        .then(reg => console.log('SW registered'))
        .catch(err => console.log('SW failed:', err));
    });
}
