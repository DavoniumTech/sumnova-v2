import { getCurrentUser } from './auth.js';

export function initRouter() {
    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('load', handleRoute);

    document.addEventListener('click', (e) => {
        const link = e.target.closest('[data-link]');
        if (link) {
            e.preventDefault();
            const route = link.getAttribute('data-route') || 'landing';
            navigateTo(route);
        }
    });
}

export function navigateTo(route) {
    window.location.hash = '#' + route;
}

export function handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'landing';
    const protectedRoutes = ['dashboard', 'workspace', 'history', 'profile'];

    const user = getCurrentUser();
    if (protectedRoutes.includes(hash) && !user) {
        navigateTo('auth');
        return;
    }

    const sections = document.querySelectorAll('.view-section');
    sections.forEach(sec => sec.classList.remove('active'));

    const targetSection = document.getElementById('view-' + hash);
    if (targetSection) {
        targetSection.classList.add('active');
        window.scrollTo(0, 0);
    } else {
        const landing = document.getElementById('view-landing');
        if (landing) landing.classList.add('active');
    }

    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    navLinks.forEach(link => {
        if (link.getAttribute('data-route') === hash) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    const mobileNav = document.getElementById('mobile-nav');
    if (mobileNav) {
        mobileNav.classList.add('hidden');
    }
}
