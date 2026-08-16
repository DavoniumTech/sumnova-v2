import { initRouter, navigateTo } from './router.js';
import { initAuth, getCurrentUser, onAuthStateChangedListener, signOutUser } from './auth.js';
import { initUI, showToast, updateAuthUI } from './ui.js';
import { initSettings, applySavedTheme } from './settings.js';
import { initWorkspace } from './ai.js';
import { getUserSummaries, deleteSummaryRecord } from './firestore.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log('SumNova V2 initializing...');

    applySavedTheme();
    initUI();
    initSettings();
    initRouter();

    try {
        initAuth();
        onAuthStateChangedListener(async (user) => {
            updateAuthUI(user);
            if (user) {
                loadDashboardData(user.uid);
                loadHistoryData(user.uid);
                loadProfileData(user);
            }
        });
    } catch (err) {
        console.warn('Firebase initialization pending real configuration in firebaseconfig.js');
    }

    initWorkspace();

    const refreshHistoryBtn = document.getElementById('refresh-history-btn');
    if (refreshHistoryBtn) {
        refreshHistoryBtn.addEventListener('click', () => {
            const user = getCurrentUser();
            if (user) {
                loadHistoryData(user.uid);
                showToast('History refreshed', 'success');
            } else {
                showToast('Please sign in to view history', 'error');
            }
        });
    }

    if ('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('./serviceworker.js');
        } catch (err) {
            console.warn('ServiceWorker registration failed:', err);
        }
    }

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
                recentContainer.innerHTML = `<div class="card p-6 text-center text-muted text-sm col-span-full">No summaries yet. Head over to the workspace to create your first summary!</div>`;
                return;
            }

            recentContainer.innerHTML = summaries.slice(0, 4).map(s => `
                <div class="card p-5 space-y-2">
                    <div class="flex items-center justify-between">
                        <h4 class="font-bold text-sm truncate max-w-[200px]">${escapeHTML(s.title || 'Untitled Summary')}</h4>
                        <span class="badge">${escapeHTML(s.summaryType || 'quick')}</span>
                    </div>
                    <p class="text-xs text-muted line-clamp-2">${escapeHTML(s.summary)}</p>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error('Error loading dashboard stats:', err);
    }
}

async function loadHistoryData(uid) {
    const historyContainer = document.getElementById('history-list-container');
    if (!historyContainer) return;

    try {
        historyContainer.innerHTML = `<div class="card p-8 text-center text-muted col-span-full">Loading saved summaries...</div>`;
        const summaries = await getUserSummaries(uid);

        if (summaries.length === 0) {
            historyContainer.innerHTML = `
                <div class="card p-12 text-center col-span-full space-y-4">
                    <p class="text-muted text-sm">No saved summaries found in your cloud history.</p>
                    <a href="#workspace" class="btn btn-primary px-6 py-2.5 text-xs font-semibold" data-link data-route="workspace">Go to Workspace</a>
                </div>`;
            return;
        }

        historyContainer.innerHTML = summaries.map(s => `
            <div class="card p-6 space-y-3 flex flex-col justify-between" data-id="${escapeHTML(s.summaryId)}">
                <div class="space-y-1">
                    <div class="flex items-center justify-between">
                        <h4 class="font-bold text-base">${escapeHTML(s.title || 'Untitled Summary')}</h4>
                        <span class="badge uppercase">${escapeHTML(s.summaryType || 'quick')}</span>
                    </div>
                    <p class="text-xs text-muted line-clamp-3">${escapeHTML(s.summary)}</p>
                </div>
                <div class="flex items-center justify-between pt-2 border-t text-xs">
                    <span class="text-muted">Saved securely</span>
                    <button class="delete-summary-btn text-danger font-medium text-btn" data-id="${escapeHTML(s.summaryId)}">Delete</button>
                </div>
            </div>
        `).join('');

        historyContainer.querySelectorAll('.delete-summary-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const summaryId = e.target.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this saved summary?')) {
                    try {
                        await deleteSummaryRecord(summaryId);
                        showToast('Summary deleted successfully', 'success');
                        loadHistoryData(uid);
                        loadDashboardData(uid);
                    } catch (err) {
                        showToast('Failed to delete summary', 'error');
                    }
                }
            });
        });

    } catch (err) {
        console.error('Error loading history:', err);
        historyContainer.innerHTML = `<div class="card p-8 text-center text-danger col-span-full">Failed to load history. Please try again.</div>`;
    }
}

function loadProfileData(user) {
    const nameEl = document.getElementById('profile-name');
    const emailEl = document.getElementById('profile-email');
    const uidEl = document.getElementById('profile-uid');
    const avatarEl = document.getElementById('profile-avatar-large');

    if (nameEl) nameEl.textContent = user.displayName || 'SumNova User';
    if (emailEl) emailEl.textContent = user.email || '';
    if (uidEl) uidEl.textContent = user.uid || '';
    if (avatarEl) avatarEl.textContent = (user.displayName || user.email || 'U').charAt(0).toUpperCase();
}

function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}
