import { 
    getFirestore, 
    collection, 
    doc, 
    setDoc, 
    getDocs, 
    deleteDoc, 
    query, 
    where, 
    serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js';
import { app } from './auth.js';
import { getCurrentUser } from './auth.js';

let db;
try {
    if (app) {
        db = getFirestore(app);
    }
} catch (err) {
    console.warn('Firestore initialization pending real credentials.');
}

export async function saveSummaryRecord(summaryData) {
    const user = getCurrentUser();
    if (!user) throw new Error('Authentication required to save summaries.');
    if (!db) throw new Error('CONFIGURATION REQUIRED: Firebase database missing.');

    const summaryId = 'sum_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const docRef = doc(db, 'summaries', summaryId);
    
    const payload = {
        summaryId,
        userId: user.uid,
        title: summaryData.title || 'Untitled Summary',
        inputPreview: summaryData.input.substring(0, 150),
        summary: summaryData.summary,
        summaryType: summaryData.summaryType || 'quick',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    };

    await setDoc(docRef, payload);
    return summaryId;
}

export async function getUserSummaries(uid) {
    if (!db) {
        return [];
    }
    try {
        const q = query(collection(db, 'summaries'), where('userId', '==', uid));
        const snapshot = await getDocs(q);
        const results = [];
        snapshot.forEach(docSnap => {
            results.push(docSnap.data());
        });
        return results.sort((a, b) => (b.createdAt?.toMillis?.() || Date.now()) - (a.createdAt?.toMillis?.() || Date.now()));
    } catch (err) {
        console.error('Error fetching summaries:', err);
        return [];
    }
}

export async function deleteSummaryRecord(summaryId) {
    if (!db) throw new Error('CONFIGURATION REQUIRED.');
    await deleteDoc(doc(db, 'summaries', summaryId));
}
