// tools/image/compressor.js
import { store } from '../../state.js';
import { Toast, formatFileSize } from '../../utils/ui-utils.js';
import { Modal } from '../../components/Modal.js';
import { compressPDF } from '../pdf/compressor.js';
import { editPDF } from '../pdf/editor.js';
import { convertImage } from './converter.js';
import { mergePDFs } from '../pdf/merger.js';
import { ensurePDFLibrariesLoaded } from '../../navigation.js';


export async function processFile() {
    const isMultiFileTool = store.activeTool === 'MERGE PDF' || store.activeTool === 'BULK COMPRESS';
    
    if (!store.originalFile && !isMultiFileTool) {
        Toast.show(`Please select ${store.currentFileType === 'pdf' ? 'a PDF' : 'an image'} first`, 'error');
        return;
    }

    if (isMultiFileTool && (!store.originalFiles || store.originalFiles.length < 2)) {
        Toast.show('Please select at least 2 files.', 'error');
        return;
    }

    if (store.activeTool === 'PDF COMPRESSOR') {
        await ensurePDFLibrariesLoaded();
        return await compressPDF();
    }
    
    if (store.activeTool === 'PDF EDITOR') {
        await ensurePDFLibrariesLoaded();
        return await editPDF();
    }

    if (store.activeTool === 'IMAGE CONVERTER') {
        return await convertImage();
    }

    if (store.activeTool === 'MERGE PDF') {
        await ensurePDFLibrariesLoaded();
        return await mergePDFs();
    }

    const targetSizeKB = parseInt(document.getElementById('customSize')?.value);
    if (!targetSizeKB || targetSizeKB < 1) {
        Toast.show('Please enter a valid target size', 'error');
        return;
    }

    const targetSizeBytes = targetSizeKB * 1024;
    let quality = parseFloat(document.getElementById('qualitySlider')?.value || 0.8);

    startProcessing();

    try {
        if (store.activeTool === 'BULK COMPRESS') {
            const compressedResults = [];
            const filesCount = store.originalFiles.length;
            
            for (let i = 0; i < filesCount; i++) {
                const file = store.originalFiles[i];
                store.progress = Math.round((i / filesCount) * 100);
                
                const { blob, convertedToJPEG } = await runCompressionSearch(file, targetSizeBytes, quality);
                
                // Fall back to original file if compression didn't help (size increased)
                const finalBlob = blob.size <= file.size ? blob : file;
                
                compressedResults.push({
                    name: file.name,
                    originalSize: file.size,
                    compressedSize: finalBlob.size,
                    blob: finalBlob
                });
            }
            
            store.compressedBlobs = compressedResults;
            store.progress = 100;
            displayBulkResults();
            Toast.show(`Compressed ${filesCount} images successfully!`, 'success');
        } else {
            // Single file compression
            const { blob, convertedToJPEG } = await runCompressionSearch(store.originalFile, targetSizeBytes, quality);
            
            if (blob.size > store.originalFile.size) {
                Toast.show(`Unable to compress to ${targetSizeKB}KB. Minimum achievable: ${formatFileSize(blob.size)}`, 'error');
                store.compressedBlob = null;
            } else {
                store.compressedBlob = blob;
                handleSuccess(convertedToJPEG);
            }
        }
    } catch (error) {
        Toast.show('Compression failed: ' + error.message, 'error');
    } finally {
        endProcessing();
    }
}

async function runCompressionSearch(file, targetSizeBytes, baseQuality) {
    const img = await loadImage(file);
    let attempts = 0;
    const maxAttempts = 20;
    let lastBlob = null;
    let minQuality = 0.1;
    let maxQuality = baseQuality;
    let quality = baseQuality;
    let mimeType = file.type;
    let convertedToJPEG = false;

    while (attempts < maxAttempts) {
        attempts++;
        const blob = await compressWithQuality(img, quality, mimeType);
        lastBlob = blob;

        const sizeDiff = blob.size - targetSizeBytes;
        const tolerance = targetSizeBytes * 0.05;

        if (Math.abs(sizeDiff) <= tolerance) {
            return { blob, convertedToJPEG };
        }

        if (blob.size > targetSizeBytes) {
            maxQuality = quality;
            quality = (minQuality + quality) / 2;
        } else {
            minQuality = quality;
            quality = (quality + maxQuality) / 2;
        }

        if (maxQuality - minQuality < 0.01) {
            if (mimeType === 'image/png' && !convertedToJPEG && blob.size > targetSizeBytes) {
                convertedToJPEG = true;
                mimeType = 'image/jpeg';
                minQuality = 0.1;
                maxQuality = 0.8;
                quality = 0.5;
                attempts = 0;
                continue;
            }
            return { blob, convertedToJPEG };
        }

        await new Promise(resolve => setTimeout(resolve, 50));
    }
    return { blob: lastBlob, convertedToJPEG };
}

function startProcessing() {
    Toast.hideAll();
    store.isLoading = true;
    store.progress = 0;
}

function endProcessing() {
    store.isLoading = false;
    setTimeout(() => { store.progress = 0; }, 1000);
}

function handleSuccess(convertedToJPEG) {
    store.progress = 100;
    displayResults();
    
    let msg = 'Image compressed successfully!';
    if (convertedToJPEG) msg += ' (Converted PNG to JPEG for better size)';
    Toast.show(msg, 'success');
}

export function loadImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(img.src);
            resolve(img);
        };
        img.onerror = (err) => {
            URL.revokeObjectURL(img.src);
            reject(err);
        };
        img.src = URL.createObjectURL(file);
    });
}

function compressWithQuality(img, quality, mimeType) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        if (mimeType === 'image/jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => resolve(blob), mimeType, quality);
    });
}

function displayResults() {
    // Preview image is reactively rendered by ui-utils.js subscription to store.compressedBlob

    const reduction = ((1 - store.compressedBlob.size / store.originalFile.size) * 100).toFixed(1);
    const saved = store.originalFile.size - store.compressedBlob.size;

    document.getElementById('compressedSize').textContent = formatFileSize(store.compressedBlob.size);
    document.getElementById('reduction').textContent = `${reduction}%`;
    document.getElementById('actionButtons').classList.add('active');

    Modal.show({
        original: store.originalFile.size,
        compressed: store.compressedBlob.size,
        reduction: reduction,
        saved: saved
    });
}

function displayBulkResults() {
    // Show action buttons
    document.getElementById('actionButtons').classList.add('active');

    // Display summary modal
    const totalOriginal = store.compressedBlobs.reduce((acc, curr) => acc + curr.originalSize, 0);
    const totalCompressed = store.compressedBlobs.reduce((acc, curr) => acc + curr.compressedSize, 0);
    const totalSaved = totalOriginal - totalCompressed;
    const reduction = totalOriginal > 0 ? ((1 - totalCompressed / totalOriginal) * 100).toFixed(1) : '0';

    Modal.show({
        original: totalOriginal,
        compressed: totalCompressed,
        reduction: reduction,
        saved: totalSaved > 0 ? totalSaved : 0,
        title: 'Bulk Compression Complete',
        message: `Successfully processed ${store.compressedBlobs.length} images.`
    });
}

export function downloadFile() {
    if (store.activeTool === 'BULK COMPRESS') {
        if (!store.compressedBlobs || store.compressedBlobs.length === 0) return;
        
        store.compressedBlobs.forEach((item, index) => {
            setTimeout(() => {
                const url = URL.createObjectURL(item.blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `compressed_${item.name}`;
                a.click();
                URL.revokeObjectURL(url);
            }, index * 200);
        });
        return;
    }

    if (!store.compressedBlob) return;
    const url = URL.createObjectURL(store.compressedBlob);
    const a = document.createElement('a');
    a.href = url;
    
    let filename = `kbify_${Date.now()}`;
    if (store.activeTool === 'MERGE PDF') {
        filename = 'merged_document.pdf';
    } else if (store.activeTool === 'IMAGE CONVERTER') {
        const ext = store.compressedBlob.type.split('/')[1];
        filename = `converted_${store.originalFile.name.split('.')[0]}.${ext}`;
    } else {
        filename = `compressed_${store.originalFile ? store.originalFile.name : 'file'}`;
    }
    
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

