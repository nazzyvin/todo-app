(function () {
    function resolveTheme(theme) {
        if (theme === 'system') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return theme;
    }

    function applyTheme(theme) {
        const resolved = resolveTheme(theme);
        document.documentElement.setAttribute('data-theme', resolved);
        localStorage.setItem('theme', theme);

        const icon = document.getElementById('theme-icon');
        if (icon) {
            icon.className = theme === 'dark' ? 'bi bi-moon-fill'
                : theme === 'light' ? 'bi bi-sun-fill'
                : 'bi bi-circle-half';
        }

        document.querySelectorAll('.theme-option').forEach(opt => {
            opt.classList.toggle('active', opt.getAttribute('data-theme-value') === theme);
        });
    }

    // Apply immediately, before DOM is ready, to avoid flash
    applyTheme(localStorage.getItem('theme') || 'system');

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
        if (localStorage.getItem('theme') === 'system') applyTheme('system');
    });

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('.theme-option').forEach(opt => {
            opt.addEventListener('click', function (e) {
                e.preventDefault();
                applyTheme(this.getAttribute('data-theme-value'));
            });
        });
    });
})();