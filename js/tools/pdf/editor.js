/**
 * PDF editor module for visual manipulation (Adding text, repositioning)
 * Uses PDF-Lib for saving and PDF.js for rendering.
 */
import { store, subscribe } from '../../state.js';
import { Toast, formatFileSize } from '../../utils/ui-utils.js';
import { Modal } from '../../components/Modal.js';
import { PDFViewer } from './viewer.js';

let textElements = [];       // Track added UI elements
let activeElement = null;   // Currently focused element

const UI = {
    get container() { return document.getElementById('pdfVisualContainer'); },
    get sizeSelect() { return document.getElementById('fontSizeSelect'); },
    get colorSelect() { return document.getElementById('textColorSelect'); },
    get previewSection() { return document.getElementById('previewSection'); },
    get compSizeText() { return document.getElementById('compressedSize'); },
    get reductionText() { return document.getElementById('reduction'); }
};

// Auto-render when a new file is uploaded in PDF Editor mode
subscribe('originalFile', (file) => {
    if (file && store.activeTool === 'PDF EDITOR') {
        renderInEditor(file);
    }
});

/**
 * Initialize the visual editor workspace
 */
export async function renderInEditor(file) {
    if (!UI.container) return;

    await PDFViewer.render(file, UI.container);
    setupEditorInteractions();
    
    // Reset state for new document
    textElements = [];
    activeElement = null;
}

/**
 * Global interactions for the workspace
 */
function setupEditorInteractions() {
    // 1. Listen for clicks on page overlays to add text
    document.querySelectorAll('.pdf-overlay').forEach(overlay => {
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                const rect = overlay.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const pageNum = parseInt(overlay.dataset.page);
                
                spawnTextElement(overlay, x, y, pageNum);
            }
        };
    });

    // 2. Toolbar listeners for real-time updates of selected text
    UI.sizeSelect?.addEventListener('change', () => {
        if (activeElement) activeElement.style.fontSize = `${UI.sizeSelect.value}px`;
    });

    UI.colorSelect?.addEventListener('input', () => {
        if (activeElement) activeElement.style.color = UI.colorSelect.value;
    });
}

/**
 * Instantiate a new draggable/editable text element
 */
function spawnTextElement(parent, x, y, pageNum) {
    const fontSize = UI.sizeSelect?.value || '16';
    const color = UI.colorSelect?.value || '#000000';
    
    const el = document.createElement('div');
    el.className = 'pdf-text-element';
    el.contentEditable = true;
    el.style.cssText = `left: ${x}px; top: ${y}px; font-size: ${fontSize}px; color: ${color};`;
    el.textContent = 'Type here...';
    
    // Add delete functionality
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'pdf-delete-btn';
    deleteBtn.innerHTML = '✕';
    deleteBtn.onclick = (e) => {
        e.stopPropagation();
        el.remove();
        textElements = textElements.filter(item => item.dom !== el);
        activeElement = null;
    };
    el.appendChild(deleteBtn);
    
    // Handle Draggable logic
    setupDragging(el, parent);

    // Sync element focus with toolbar
    const syncToolbar = () => {
        activeElement = el;
        if (UI.sizeSelect) UI.sizeSelect.value = parseInt(el.style.fontSize);
        if (UI.colorSelect) UI.colorSelect.value = rgbToHex(el.style.color);
        
        // Highlight active visually
        document.querySelectorAll('.pdf-text-element').forEach(item => item.style.borderStyle = 'dashed');
        el.style.borderStyle = 'solid';
        el.style.borderColor = '#3b82f6';
    };

    el.onfocus = syncToolbar;
    el.onclick = (e) => { e.stopPropagation(); syncToolbar(); };
    parent.appendChild(el);
    
    textElements.push({ dom: el, page: pageNum });

    // Initial focus & select all
    setTimeout(() => {
        el.focus();
        document.execCommand('selectAll', false, null);
    }, 0);
}

/**
 * Handle HTML5 drag behavior within the page boundaries
 */
function setupDragging(el, container) {
    let offsetX, offsetY;

    const onMouseMove = (e) => {
        const rect = container.getBoundingClientRect();
        const nx = Math.max(0, Math.min(e.clientX - offsetX, rect.width - el.offsetWidth));
        const ny = Math.max(0, Math.min(e.clientY - offsetY, rect.height - el.offsetHeight));
        el.style.left = `${nx}px`;
        el.style.top = `${ny}px`;
    };

    const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };

    el.onmousedown = (e) => {
        if (e.target.className === 'pdf-delete-btn') return;
        offsetX = e.clientX - el.offsetLeft;
        offsetY = e.clientY - el.offsetTop;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };
}

/**
 * Final Export: Map coordinates to PDF units and Save
 */
export async function editPDF() {
    if (!store.originalFile) return;
    if (textElements.length === 0) {
        Toast.show('No changes made to the PDF.', 'info');
        return;
    }

    store.isLoading = true;
    store.progress = 10;

    try {
        const buffer = await store.originalFile.arrayBuffer();
        const pdfDoc = await PDFLib.PDFDocument.load(buffer);
        const pages = pdfDoc.getPages();
        
        store.progress = 40;

        for (const item of textElements) {
            const page = pages[item.page - 1];
            const { width, height } = page.getSize();
            const el = item.dom;
            const parent = el.parentElement;
            
            // Map HTML Pixels -> PDF Points
            const ratioX = width / parent.clientWidth;
            const ratioY = height / parent.clientHeight;
            
            const pdfX = parseFloat(el.style.left) * ratioX;
            const pdfY = height - (parseFloat(el.style.top) + parseInt(el.style.fontSize)) * ratioY;

            const color = hexToRgb(el.style.color);

            page.drawText(el.innerText.replace('✕', '').trim(), {
                x: pdfX,
                y: pdfY,
                size: parseInt(el.style.fontSize) * ratioX,
                color: PDFLib.rgb(color.r / 255, color.g / 255, color.b / 255)
            });
        }

        store.progress = 90;
        const bytes = await pdfDoc.save();
        store.compressedBlob = new Blob([bytes], { type: 'application/pdf' });
        
        handleSuccess();
    } catch (err) {
        console.error('Export Error:', err);
        Toast.show('Failed to save changes: ' + err.message, 'error');
    } finally {
        store.isLoading = false;
        store.progress = 0;
    }
}

// --- Utilities ---

function handleSuccess() {
    const diff = store.compressedBlob.size - store.originalFile.size;
    if (UI.compSizeText) UI.compSizeText.textContent = formatFileSize(store.compressedBlob.size);
    if (UI.reductionText) UI.reductionText.textContent = 'Edited';

    Modal.show({
        original: store.originalFile.size,
        compressed: store.compressedBlob.size,
        reduction: 0,
        saved: -diff
    }, 'PDF Edited Successfully!');
    
    Toast.show('PDF edited successfully!', 'success');
}

function hexToRgb(hex) {
    if (hex.startsWith('rgb')) {
        const parts = hex.match(/\d+/g);
        return { r: parseInt(parts[0]), g: parseInt(parts[1]), b: parseInt(parts[2]) };
    }
    const res = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return res ? { r: parseInt(res[1], 16), g: parseInt(res[2], 16), b: parseInt(res[3], 16) } : { r: 0, g: 0, b: 0 };
}

function rgbToHex(rgb) {
    if (rgb.startsWith('#')) return rgb;
    const parts = rgb.match(/\d+/g);
    if (!parts) return '#000000';
    const toHex = (c) => parseInt(c).toString(16).padStart(2, '0');
    return `#${toHex(parts[0])}${toHex(parts[1])}${toHex(parts[2])}`;
}

export function clearEditorState() {
    textElements = [];
    activeElement = null;
    const container = document.getElementById('pdfVisualContainer');
    if (container) container.innerHTML = '';
}
