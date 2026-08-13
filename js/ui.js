import { navigateTo } from './router.js';
import { signInUser, signUpUser } from './auth.js';

export function initUI() {
    // Theme Toggle
    const themeToggleBtn = document.getElementById('theme-toggle');
    const settingsThemeToggle = document.getElementById('settings-theme-toggle');
    
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
    if (settingsThemeToggle) {
        settingsThemeToggle.addEventListener('click', toggleTheme);
    }

    // Auth Form handling
    const authForm = document.getElementById('auth-form');
    const authToggleMode = document.getElementById('auth-toggle-mode');
    let isSignUp = false;

    if (authToggleMode) {
        authToggleMode.addEventListener('click', () => {
            isSignUp = !isSignUp;
            const titleEl = document.getElementById('auth-title');
            const subtitleEl = document.getElementById('auth-subtitle');
            const submitBtn = document.getElementById('auth-submit-btn');
            const nameField = document.getElementById('name-field-container');

            if (isSignUp) {
                titleEl.textContent = 'Create an Account';
                subtitleEl.textContent = 'Join SumNova V2 and start learning faster today.';
                submitBtn.textContent = 'Create Account';
                authToggleMode.textContent = 'Already have an account? Sign in';
                nameField.classList.remove('hidden');
            } else {
                titleEl.textContent = 'Welcome to SumNova';
                subtitleEl.textContent = 'Sign in to sync your study notes across all devices.';
                submitBtn.textContent = 'Sign In';
                authToggleMode.textContent = "Don't have an account? Sign up";
                nameField.classList.add('hidden');
            }
        });
    }

    if (authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('auth-email').value;
            const password = document.getElementById('auth-password').value;
            const name = document.getElementById('auth-name')?.value;
            const errorBox = document.getElementById('auth-error-box');
            errorBox.classList.add('hidden');

            try {
                if (isSignUp) {
                    await signUpUser(email, password, name);
                    showToast('Account created successfully!', 'success');
                } else {
                    await signInUser(email, password);
                    showToast('Signed in successfully!', 'success');
                }
                navigateTo('dashboard');
            } catch (err) {
                errorBox.textContent = err.message || 'Authentication error occurred.';
                errorBox.classList.remove('hidden');
            }
        });
    }

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
        mobileMenu.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                mobileMenu.classList.add('hidden');
            }
        });
    }
}

export function toggleTheme() {
    const htmlEl = document.documentElement;
    const isDark = htmlEl.classList.contains('dark');
    if (isDark) {
        htmlEl.classList.remove('dark');
        localStorage.setItem('sumnova_theme', 'light');
    } else {
        htmlEl.classList.add('dark');
        localStorage.setItem('sumnova_theme', 'dark');
    }
}

export function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `p-4 rounded-xl shadow-lg text-xs font-semibold text-white pointer-events-auto transition transform translate-y-2 opacity-0 ${
        type === 'error' ? 'bg-red-600' : 'bg-purple-600'
    }`;
    toast.textContent = message;

    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
    }, 10);

    setTimeout(() => {
        toast.classList.add('translate-y-2', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

export function updateAuthUI(user) {
    const signinBtn = document.getElementById('nav-signin-btn');
    const userMenu = document.getElementById('user-menu');
    const authRequiredElements = document.querySelectorAll('.auth-required');

    if (user) {
        if (signinBtn) signinBtn.classList.add('hidden');
        if (userMenu) userMenu.classList.remove('hidden');
        authRequiredElements.forEach(el => el.classList.remove('hidden'));

        const displayNameEl = document.getElementById('user-display-name');
        const avatarEl = document.getElementById('user-avatar-initial');
        const name = user.displayName || user.email || 'User';
        if (displayNameEl) displayNameEl.textContent = name;
        if (avatarEl) avatarEl.textContent = name.charAt(0).toUpperCase();

        // Update profile view if present
        const profileName = document.getElementById('profile-name');
        const profileEmail = document.getElementById('profile-email');
        const profileUid = document.getElementById('profile-uid');
        const profileAvatar = document.getElementById('profile-avatar-initial');
        if (profileName) profileName.textContent = name;
        if (profileEmail) profileEmail.textContent = user.email;
        if (profileUid) profileUid.textContent = user.uid;
        if (profileAvatar) profileAvatar.textContent = name.charAt(0).toUpperCase();
    } else {
        if (signinBtn) signinBtn.classList.remove('hidden');
        if (userMenu) userMenu.classList.add('hidden');
        authRequiredElements.forEach(el => el.classList.add('hidden'));
    }
}
