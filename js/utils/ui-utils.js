// utils/ui-utils.js
import { store, subscribe } from '../state.js';

// Reactive Progress Bar
subscribe('progress', (percent) => {
    const progressFill = document.getElementById('progressFill');
    const progressContainer = document.getElementById('progressContainer');
    
    if (progressFill) {
        progressFill.style.width = percent + '%';
        progressFill.textContent = Math.round(percent) + '%';
    }
    
    if (progressContainer) {
        if (percent > 0 && percent < 100) progressContainer.classList.add('active');
        else if (percent === 100) setTimeout(() => progressContainer.classList.remove('active'), 1000);
    }
});

// Reactive Loader
subscribe('isLoading', (loading) => {
    const loader = document.getElementById('loader');
    if (loader) {
        if (loading) loader.classList.add('active');
        else loader.classList.remove('active');
    }
});

let currentPreviewUrl = null;

subscribe('compressedBlob', (blob) => {
    if (currentPreviewUrl) {
        URL.revokeObjectURL(currentPreviewUrl);
        currentPreviewUrl = null;
    }

    const preview = document.getElementById('compressedPreview');
    if (!preview) return;

    if (blob) {
        currentPreviewUrl = URL.createObjectURL(blob);
        preview.src = currentPreviewUrl;
        preview.style.display = 'block';
    } else {
        preview.removeAttribute('src');
        preview.style.display = 'none';
    }
});

export const Toast = {
    show(message, type = 'success') {
        const id = type === 'success' ? 'successMessage' : 'errorMessage';
        const el = document.getElementById(id);
        if (!el) return;

        el.textContent = (type === 'success' ? '✅ ' : '❌ ') + message;
        el.classList.add('active');
        
        const duration = type === 'success' ? 3000 : 5000;
        setTimeout(() => el.classList.remove('active'), duration);
    },
    
    hideAll() {
        document.getElementById('errorMessage')?.classList.remove('active');
        document.getElementById('successMessage')?.classList.remove('active');
    }
};

export function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

export function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}
