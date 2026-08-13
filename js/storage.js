export const storage = {
    set(key, value) {
        try {
            localStorage.setItem(`sumnova_${key}`, JSON.stringify(value));
        } catch (err) {
            console.error('Storage set error:', err);
        }
    },
    get(key) {
        try {
            const item = localStorage.getItem(`sumnova_${key}`);
            return item ? JSON.parse(item) : null;
        } catch (err) {
            console.error('Storage get error:', err);
            return null;
        }
    },
    remove(key) {
        try {
            localStorage.removeItem(`sumnova_${key}`);
        } catch (err) {
            console.error('Storage remove error:', err);
        }
    }
};
