export function initUI() {
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');

    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener('click', () => {
            mobileNav.classList.toggle('hidden');
        });
    }

    const userMenuToggle = document.getElementById('user-menu-toggle');
    const userDropdown = document.getElementById('user-dropdown');

    if (userMenuToggle && userDropdown) {
        userMenuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('hidden');
        });

        document.addEventListener('click', () => {
            userDropdown.classList.add('hidden');
        });
    }
}

export function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

export function updateAuthUI(user) {
    const signinBtn = document.getElementById('header-signin-btn');
    const userMenuContainer = document.getElementById('user-menu-container');
    const mobileAuthSection = document.getElementById('mobile-auth-section');
    const protectedRoutes = document.querySelectorAll('.protected-route');

    if (user) {
        if (signinBtn) signinBtn.classList.add('hidden');
        if (userMenuContainer) userMenuContainer.classList.remove('hidden');
        if (mobileAuthSection) mobileAuthSection.classList.add('hidden');
        protectedRoutes.forEach(el => el.classList.remove('hidden'));

        const nameEl = document.getElementById('dropdown-user-name');
        const emailEl = document.getElementById('dropdown-user-email');
        const avatarEl = document.getElementById('user-avatar-initial');

        if (nameEl) nameEl.textContent = user.displayName || 'SumNova User';
        if (emailEl) emailEl.textContent = user.email || '';
        if (avatarEl) avatarEl.textContent = (user.displayName || user.email || 'U').charAt(0).toUpperCase();
    } else {
        if (signinBtn) signinBtn.classList.remove('hidden');
        if (userMenuContainer) userMenuContainer.classList.add('hidden');
        if (mobileAuthSection) mobileAuthSection.classList.remove('hidden');
        protectedRoutes.forEach(el => el.classList.add('hidden'));
    }
}
