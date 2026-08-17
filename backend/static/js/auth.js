const API = '/api';

// If already logged in, go straight to app
if (localStorage.getItem('token')) {
    window.location.href = '/';
}

function showError(message) {
    const el = document.getElementById('auth-error');
    el.textContent = message;
    el.classList.remove('d-none');
}

// Password visibility toggle
document.querySelectorAll('.password-toggle').forEach(toggle => {
    toggle.addEventListener('click', function() {
        const input = document.getElementById(this.getAttribute('data-target'));
        const icon = this.querySelector('i');
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.replace('bi-eye', 'bi-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.replace('bi-eye-slash', 'bi-eye');
        }
    });
});

// Toggle between login and register
document.getElementById('show-register').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('login-form').classList.add('d-none');
    document.getElementById('register-form').classList.remove('d-none');
    document.getElementById('auth-error').classList.add('d-none');
});

document.getElementById('show-login').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('register-form').classList.add('d-none');
    document.getElementById('login-form').classList.remove('d-none');
    document.getElementById('auth-error').classList.add('d-none');
});

// Login
document.getElementById('login-btn').addEventListener('click', async function() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();

    if (!username || !password) return showError('Please enter username and password');

    const res = await fetch(`${API}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', username);
        window.location.href = '/';
    } else {
        showError(data.error || 'Login failed');
    }
});

// Register
document.getElementById('register-btn').addEventListener('click', async function() {
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value.trim();

    if (!username || !password) return showError('Please enter username and password');

    const res = await fetch(`${API}/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', username);
        window.location.href = '/';
    } else {
        showError(data.error || 'Registration failed');
    }
});

// Enter key for login
document.getElementById('login-password').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('login-btn').click();
    }
});

// Enter key for register
document.getElementById('register-password').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('register-btn').click();
    }
});

// Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/static/js/service-worker.js')
        .then(reg => console.log('SW registered'))
        .catch(err => console.log('SW failed:', err));
    });
}
