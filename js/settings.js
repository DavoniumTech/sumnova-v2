export function initSettings() {
    // Settings preference management
}

export function applySavedTheme() {
    const savedTheme = localStorage.getItem('sumnova_theme');
    const htmlEl = document.documentElement;
    if (savedTheme === 'light') {
        htmlEl.classList.remove('dark');
    } else {
        htmlEl.classList.add('dark');
    }
}
