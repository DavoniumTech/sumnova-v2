import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js';
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    updateProfile
} from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js';
import { firebaseConfig } from '../firebaseconfig.js';
import { showToast } from './ui.js';
import { navigateTo } from './router.js';

let app, auth;
let currentUser = null;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
} catch (err) {
    console.warn('Firebase initialization pending real credentials.');
}

export { app, auth };

export function initAuth() {
    const form = document.getElementById('auth-form');
    const tabSignin = document.getElementById('tab-signin');
    const tabSignup = document.getElementById('tab-signup');
    const nameGroup = document.getElementById('signup-name-group');
    const submitBtn = document.getElementById('auth-submit-btn');
    const titleEl = document.getElementById('auth-title');
    const subtitleEl = document.getElementById('auth-subtitle');
    const switchLink = document.getElementById('auth-switch-link');
    const switchText = document.getElementById('auth-switch-text');

    let isSignUp = false;

    if (tabSignin && tabSignup) {
        tabSignin.addEventListener('click', () => {
            isSignUp = false;
            tabSignin.classList.add('active');
            tabSignup.classList.remove('active');
            if (nameGroup) nameGroup.classList.add('hidden');
            if (submitBtn) submitBtn.textContent = 'Sign In';
            if (titleEl) titleEl.textContent = 'Welcome Back';
            if (subtitleEl) subtitleEl.textContent = 'Sign in to access your cloud summaries and workspace.';
        });

        tabSignup.addEventListener('click', () => {
            isSignUp = true;
            tabSignup.classList.add('active');
            tabSignin.classList.remove('active');
            if (nameGroup) nameGroup.classList.remove('hidden');
            if (submitBtn) submitBtn.textContent = 'Create Account';
            if (titleEl) titleEl.textContent = 'Create Account';
            if (subtitleEl) subtitleEl.textContent = 'Join SumNova V2 and start learning faster today.';
        });
    }

    if (switchLink) {
        switchLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (isSignUp) {
                if (tabSignin) tabSignin.click();
            } else {
                if (tabSignup) tabSignup.click();
            }
        });
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('auth-email').value.trim();
            const password = document.getElementById('auth-password').value;
            const name = document.getElementById('auth-name') ? document.getElementById('auth-name').value.trim() : '';

            if (!email || !password) {
                showToast('Please enter both email and password.', 'error');
                return;
            }

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = isSignUp ? 'Creating account...' : 'Signing in...';
            }

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
                showToast(getFriendlyAuthError(err.code), 'error');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = isSignUp ? 'Create Account' : 'Sign In';
                }
            }
        });
    }
}

export function getCurrentUser() {
    return currentUser || (auth ? auth.currentUser : null);
}

export function onAuthStateChangedListener(callback) {
    if (!auth) {
        callback(null);
        return;
    }
    return onAuthStateChanged(auth, (user) => {
        currentUser = user;
        callback(user);
    });
}

export async function signInUser(email, password) {
    if (!auth) throw new Error('CONFIGURATION REQUIRED: Firebase credentials missing.');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
}

export async function signUpUser(email, password, displayName) {
    if (!auth) throw new Error('CONFIGURATION REQUIRED: Firebase credentials missing.');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
        await updateProfile(userCredential.user, { displayName });
    }
    return userCredential.user;
}

export async function signOutUser() {
    if (!auth) {
        currentUser = null;
        return;
    }
    await signOut(auth);
    currentUser = null;
}

function getFriendlyAuthError(code) {
    switch (code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            return 'Invalid email or password.';
        case 'auth/email-already-in-use':
            return 'Email address is already registered.';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters.';
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        default:
            return 'Authentication failed. Please try again.';
    }
}
