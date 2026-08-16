import { showToast } from './ui.js';

export function initSettings() {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const settingsThemeBtn = document.getElementById('settings-theme-btn');

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }

    if (settingsThemeBtn) {
        settingsThemeBtn.addEventListener('click', toggleTheme);
    }
}

export function applySavedTheme() {
    const savedTheme = localStorage.getItem('sumnova_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

export function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('sumnova_theme', newTheme);
    updateThemeIcon(newTheme);
    showToast(`Switched to ${newTheme} mode`, 'info');
}

function updateThemeIcon(theme) {
    const icon = document.getElementById('theme-icon');
    if (icon) {
        icon.textContent = theme === 'dark' ? '🌙' : '☀️';
    }
}
