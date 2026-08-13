import { getCurrentUser } from './auth.js';
import { showToast } from './ui.js';

const routes = {
    'landing': 'view-landing',
    'auth': 'view-auth',
    'dashboard': 'view-dashboard',
    'workspace': 'view-workspace',
    'history': 'view-history',
    'profile': 'view-profile',
    'settings': 'view-settings'
};

export function initRouter() {
    // Listen for navigation clicks
    document.addEventListener('click', (e) => {
        const target = e.target.closest('[data-route]');
        if (target) {
            e.preventDefault();
            const route = target.getAttribute('data-route');
            navigateTo(route);
        }
    });

    // Handle browser back/forward history
    window.addEventListener('popstate', (e) => {
        const route = e.state?.route || 'landing';
        renderRoute(route, false);
    });

    // Initial load route
    const initialRoute = window.location.hash.replace('#', '') || 'landing';
    navigateTo(initialRoute, false);
}

export function navigateTo(route, pushState = true) {
    if (!routes[route]) {
        route = 'landing';
    }

    // Check auth protection
    const protectedRoutes = ['dashboard', 'workspace', 'history', 'profile'];
    if (protectedRoutes.includes(route) && !getCurrentUser()) {
        showToast('Please sign in to access this area.', 'error');
        navigateTo('auth');
        return;
    }

    renderRoute(route, pushState);
}

function renderRoute(route, pushState) {
    // Hide all view sections
    Object.values(routes).forEach(viewId => {
        const el = document.getElementById(viewId);
        if (el) el.classList.add('hidden');
    });

    // Show target view section
    const targetEl = document.getElementById(routes[route]);
    if (targetEl) {
        targetEl.classList.remove('hidden');
        window.scrollTo(0, 0);
    }

    if (pushState) {
        history.pushState({ route }, '', `#${route}`);
    }

    // Update active nav styles if needed
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('data-route') === route) {
            link.classList.add('text-purple-600', 'dark:text-purple-400');
        } else {
            link.classList.remove('text-purple-600', 'dark:text-purple-400');
        }
    });
}
