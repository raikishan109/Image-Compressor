// tools/common.js
import { store } from '../state.js';
import { Toast } from '../utils/ui-utils.js';
import { clearEditorState } from './pdf/editor.js';

export function reset() {
    store.originalFile = null;
    store.originalFiles = [];
    store.compressedBlob = null;
    store.compressedBlobs = [];
    store.progress = 0;

    const fileInput = document.getElementById('fileInput');
    const optionsSection = document.getElementById('optionsSection');
    const previewSection = document.getElementById('previewSection');
    const actionButtons = document.getElementById('actionButtons');

    if (fileInput) fileInput.value = '';
    optionsSection?.classList.remove('active');
    previewSection?.classList.remove('active');
    actionButtons?.classList.remove('active');

    // Clean up memory and state resources to prevent leaks
    clearEditorState();

    Toast.hideAll();
}
