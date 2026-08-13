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

let app, auth;
let currentUser = null;

export function initAuth() {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
    } catch (err) {
        console.warn('Firebase Auth initialization pending real credentials.');
    }
}

export function getCurrentUser() {
    return currentUser || (auth ? auth.currentUser : null);
}

export function onAuthStateChangedListener(callback) {
    if (!auth) {
        // Fallback simulation mode if credentials not set
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
