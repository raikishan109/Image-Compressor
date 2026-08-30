// store.js - Reactive State Management
const storage = {
    getItem: (key) => {
        try {
            return localStorage.getItem(key);
        } catch {
            return null;
        }
    },
    setItem: (key, value) => {
        try {
            if (value) localStorage.setItem(key, value);
            else localStorage.removeItem(key);
        } catch (e) {
            console.warn('Storage limit reached or blocked:', e);
        }
    }
};

export const store = new Proxy({
    originalFile: null,
    originalFiles: [],
    compressedBlob: null,
    compressedBlobs: [],
    selectedSize: 'custom',
    currentFileType: 'image',
    activeTool: null,  // Never persist — always start fresh
    currentSection: storage.getItem('currentSection') || 'dashboard',
    theme: storage.getItem('theme') || 'dark',
    isLoading: false,
    progress: 0,
}, {
    set(target, key, value) {
        target[key] = value;
        
        // Persist specific keys
        if (['currentSection', 'theme'].includes(key)) {
            storage.setItem(key, value);
        }

        // Notify listeners
        if (listeners[key]) {
            listeners[key].forEach(callback => callback(value));
        }
        
        // Global listeners
        if (listeners['*']) {
            listeners['*'].forEach(callback => callback(key, value));
        }

        return true;
    }
});

const listeners = {};

export function subscribe(key, callback) {
    if (!listeners[key]) listeners[key] = [];
    listeners[key].push(callback);
    
    // Return unsubscribe function
    return () => {
        listeners[key] = listeners[key].filter(cb => cb !== callback);
    };
}
