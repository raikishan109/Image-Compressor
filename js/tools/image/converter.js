// tools/image/converter.js
import { store } from '../../state.js';
import { Toast, formatFileSize } from '../../utils/ui-utils.js';
import { loadImage } from './compressor.js';
import { Modal } from '../../components/Modal.js';

export async function convertImage() {
    if (!store.originalFile) return;

    const targetFormatBtn = document.querySelector('#converterOptions .size-btn.active');
    const targetMime = targetFormatBtn?.getAttribute('data-format') || 'image/jpeg';
    
    store.isLoading = true;
    store.progress = 20;

    try {
        const img = await loadImage(store.originalFile);
        store.progress = 60;

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        // Handle transparency for JPEG
        if (targetMime === 'image/jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
            store.compressedBlob = blob;
            store.progress = 100;
            
            // Success Handling
            displayConvertResults(targetMime);
            Toast.show(`Converted to ${targetMime.split('/')[1].toUpperCase()} successfully!`, 'success');
            store.isLoading = false;
        }, targetMime, 0.92);

    } catch (error) {
        console.error('Conversion failed:', error);
        Toast.show('Conversion failed: ' + error.message, 'error');
        store.isLoading = false;
    }
}

function displayConvertResults(mime) {
    // Preview image is reactively rendered by ui-utils.js subscription to store.compressedBlob
    document.getElementById('compressedSize').textContent = formatFileSize(store.compressedBlob.size);
    document.getElementById('reduction').textContent = 'N/A (Convert)';
    document.getElementById('previewSection').classList.add('active');
    document.getElementById('actionButtons').classList.add('active');

    Modal.show({
        original: store.originalFile.size,
        compressed: store.compressedBlob.size,
        reduction: 'N/A',
        saved: store.originalFile.size - store.compressedBlob.size,
        title: 'Conversion Complete',
        message: `Your file has been converted to ${mime.split('/')[1].toUpperCase()}.`
    });
}
