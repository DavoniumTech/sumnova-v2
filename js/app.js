import { initRouter, navigateTo } from './router.js';
import { initAuth, getCurrentUser, onAuthStateChangedListener, signOutUser } from './auth.js';
import { initUI, showToast, toggleTheme, updateAuthUI } from './ui.js';
import { initSettings, applySavedTheme } from './settings.js';
import { initWorkspace } from './ai.js';
import { getUserSummaries } from './firestore.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log('SumNova V2 initializing...');

    // 1. Initialize Theme & UI helpers
    applySavedTheme();
    initUI();
    initSettings();

    // 2. Initialize Router & navigation events
    initRouter();

    // 3. Initialize Firebase Auth and listeners
    try {
        initAuth();
        onAuthStateChangedListener(async (user) => {
            updateAuthUI(user);
            if (user) {
                console.log('User authenticated:', user.uid);
                loadDashboardData(user.uid);
            }
        });
    } catch (err) {
        console.warn('Firebase initialization requires real credentials in firebaseconfig.js');
    }

    // 4. Initialize Workspace AI & Summary features
    initWorkspace();

    // 5. Register PWA Service Worker
    if ('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('./serviceworker.js');
            console.log('ServiceWorker registered successfully.');
        } catch (err) {
            console.warn('ServiceWorker registration failed:', err);
        }
    }

    // Sign out button binding
    const signoutBtn = document.getElementById('signout-btn');
    if (signoutBtn) {
        signoutBtn.addEventListener('click', async () => {
            await signOutUser();
            showToast('Signed out successfully', 'success');
            navigateTo('landing');
        });
    }
});

async function loadDashboardData(uid) {
    try {
        const summaries = await getUserSummaries(uid);
        const countEl = document.getElementById('stat-total-summaries');
        if (countEl) countEl.textContent = summaries.length;

        const recentContainer = document.getElementById('dashboard-recent-list');
        if (recentContainer) {
            if (summaries.length === 0) {
                recentContainer.innerHTML = `<div class="card p-6 text-center text-slate-500 text-sm col-span-full">No summaries yet. Head over to the workspace to create your first summary!</div>`;
                return;
            }

            recentContainer.innerHTML = summaries.slice(0, 4).map(s => `
                <div class="card p-5 space-y-2">
                    <div class="flex items-center justify-between">
                        <h4 class="font-bold text-sm truncate max-w-[200px]">${escapeHTML(s.title || 'Untitled Summary')}</h4>
                        <span class="text-xs px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300">${s.summaryType || 'quick'}</span>
                    </div>
                    <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">${escapeHTML(s.summary)}</p>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error('Error loading dashboard stats:', err);
    }
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}
