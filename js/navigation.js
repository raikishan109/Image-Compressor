// js/navigation.js
import { store, subscribe } from './state.js';
import { TOOLS, SECTIONS } from './tools/registry.js';
import { reset } from './tools/common.js';
import { renderInEditor } from './tools/pdf/editor.js';
import { Toast } from './utils/ui-utils.js';

let pdfLibrariesPromise = null;

export function ensurePDFLibrariesLoaded() {
    if (pdfLibrariesPromise) return pdfLibrariesPromise;

    pdfLibrariesPromise = (async () => {
        const promises = [];

        if (!window.PDFLib) {
            promises.push(new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
                script.onload = resolve;
                script.onerror = () => {
                    pdfLibrariesPromise = null;
                    reject(new Error('Failed to load PDF engine. Please check your network.'));
                };
                document.body.appendChild(script);
            }));
        }

        if (!window.pdfjsLib) {
            promises.push(new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
                script.onload = resolve;
                script.onerror = () => {
                    pdfLibrariesPromise = null;
                    reject(new Error('Failed to load PDF viewer engine. Please check your network.'));
                };
                document.body.appendChild(script);
            }));
        }

        if (promises.length > 0) {
            try {
                await Promise.all(promises);
            } catch (err) {
                console.error('PDF Engine loading error:', err);
                throw err;
            }
        }
    })();

    return pdfLibrariesPromise;
}

// --- Reactive State Subscriptions ---

subscribe('currentSection', (sectionId) => {
    updateSectionUI(sectionId);
});

subscribe('activeTool', (toolName) => {
    if (toolName) {
        renderTool(toolName);
    } else {
        renderDashboard();
    }
});

// --- Public Navigation API ---

export function switchSection(sectionId) {
    store.activeTool = null;
    store.currentSection = sectionId;
    reset();
}

export function openTool(toolName) {
    if (TOOLS[toolName]) {
        store.activeTool = toolName;
    }
}

export function closeTool() {
    store.activeTool = null;
    reset();
}

// --- UI Rendering Logic ---

/**
 * Initialize the tool grid from the Registry
 */
export function initToolGrid() {
    const grid = UI.toolDashboard;
    if (!grid) return;

    if (!grid.children || grid.children.length === 0) {
        grid.innerHTML = Object.entries(TOOLS).map(([name, config]) => `
            <div class="tool-card ${config.type}-tool" data-tool="${name}">
                <div class="tool-card-icon" style="color: ${config.color};">
                    ${config.icon}
                </div>
                <div class="tool-card-info">
                    <div class="tool-card-title">${config.label}</div>
                    <div class="tool-card-description">${config.description}</div>
                </div>
            </div>
        `).join('') + `
            <div class="tool-card coming-soon" data-tool="COMING SOON">
                <div class="tool-card-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                </div>
                <div class="tool-card-info">
                    <div class="tool-card-title">More New Tools</div>
                    <div class="tool-card-description">New compression tools are on the way</div>
                </div>
            </div>
        `;
    }
    
    updateSectionUI(store.currentSection, false);
}

function updateSectionUI(sectionId, shouldScroll = true) {
    const section = SECTIONS[sectionId] || SECTIONS.dashboard;
    
    if (UI.mainTitle) UI.mainTitle.textContent = section.title;
    if (UI.mainSubtitle) UI.mainSubtitle.textContent = section.subtitle;

    const header = document.querySelector('header');
    if (header) {
        header.style.display = (sectionId === 'dashboard' || sectionId === 'image' || sectionId === 'pdf') ? 'none' : 'flex';
    }

    const footer = document.querySelector('footer');
    if (footer) {
        footer.style.display = (sectionId === 'dashboard') ? 'flex' : 'none';
    }

    // Toggle Nav Active State
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.querySelector(`.${sectionId}-nav`)?.classList.add('active');

    // Filter Tool Grid
    document.querySelectorAll('.tool-card').forEach(card => {
        const toolName = card.getAttribute('data-tool');
        const tool = TOOLS[toolName];
        card.style.display = (sectionId === 'dashboard' || tool?.type === sectionId) ? 'flex' : 'none';
    });

    if (shouldScroll) {
        const container = document.querySelector('.container');
        if (container) container.scrollTo({ top: 0 });
    }
}

function renderTool(toolName) {
    const tool = TOOLS[toolName];
    if (!tool) return;

    const header = document.querySelector('header');
    if (header) header.style.display = 'flex';

    const footer = document.querySelector('footer');
    if (footer) footer.style.display = 'none';

    const isPDF = tool.type === 'pdf';
    if (isPDF) {
        ensurePDFLibrariesLoaded().catch(() => {});
    }

    const isEditor = toolName === 'PDF EDITOR';

    const isConverter = toolName === 'IMAGE CONVERTER';
    const isMerger = toolName === 'MERGE PDF';

    UI.toolDashboard.style.display = 'none';
    UI.mainCompressorCard.classList.add('active');
    
    // Landscape layout for standard compressors (exclude visual editor and merger)
    if (toolName !== 'PDF EDITOR' && toolName !== 'MERGE PDF') {
        UI.mainCompressorCard.classList.add('landscape-layout');
    } else {
        UI.mainCompressorCard.classList.remove('landscape-layout');
    }

    UI.activeToolIndicator.textContent = tool.label;
    UI.activeToolIndicator.style.color = tool.color;
    UI.mainTitle.textContent = tool.label;
    
    // Dynamic Subtitle
    UI.mainSubtitle.textContent = isEditor 
        ? "Click anywhere on the PDF pages to add new text. Drag to move, or click text to edit."
        : `Upload your ${isMerger || toolName === 'BULK COMPRESS' ? 'files' : 'file'} to begin ${tool.label.toLowerCase()}`;
    
    // Toggle Tool-Specific UI Elements
    UI.imageOptions.style.display = (isPDF || isConverter) ? 'none' : 'block';
    UI.pdfOptions.style.display = (isPDF && !isEditor && !isMerger) ? 'block' : 'none';
    UI.pdfEditorWorkspace.style.display = isEditor ? 'block' : 'none';
    UI.converterOptions.style.display = isConverter ? 'block' : 'none';
    UI.mergerOptions.style.display = isMerger ? 'block' : 'none';

    // Handle Shared Selected Files list visibility and title
    if (isMerger || toolName === 'BULK COMPRESS') {
        UI.selectedFilesContainer.style.display = (store.originalFiles && store.originalFiles.length > 0) ? 'block' : 'none';
        UI.fileListLabel.textContent = isMerger ? 'PDF Files to Merge' : 'Images to Compress';
    } else {
        UI.selectedFilesContainer.style.display = 'none';
    }
    
    // Manage Global Sections visibility
    if (isEditor || isMerger) {
        UI.previewSection.classList.remove('active');
        UI.actionButtons.classList.remove('active');
    }
    
    // Update Button Text
    UI.processBtn.textContent = isEditor ? 'Save & Download' : (isMerger ? 'Merge & Save' : (isPDF ? 'Process PDF' : 'Compress Now'));

    // Multi-file support
    if (isMerger || toolName === 'BULK COMPRESS') {
        UI.fileInput.setAttribute('multiple', 'true');
    } else {
        UI.fileInput.removeAttribute('multiple');
    }

    // Trigger visual editor if file already exists
    if (isEditor && store.originalFile) {
        ensurePDFLibrariesLoaded().then(() => renderInEditor(store.originalFile));
    }

    // Update file input configuration
    UI.fileInput.accept = tool.accept;
    UI.uploadHint.textContent = tool.hint;
    
    store.currentFileType = tool.type;
}

function renderDashboard() {
    UI.mainCompressorCard.classList.remove('active');
    UI.mainCompressorCard.classList.remove('landscape-layout');
    UI.toolDashboard.style.display = 'grid';
    updateSectionUI(store.currentSection);
}

export function selectSize(size, element) {
    store.selectedSize = size;
    document.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('active'));
    if (element) element.classList.add('active');

    if (size !== 'custom' && UI.customSizeInput) {
        UI.customSizeInput.value = size;
    }
}

// --- DOM Cache for performance ---
const UI = {
    get mainTitle() { return document.getElementById('mainTitle'); },
    get mainSubtitle() { return document.getElementById('mainSubtitle'); },
    get toolDashboard() { return document.getElementById('toolDashboard'); },
    get mainCompressorCard() { return document.getElementById('mainCompressorCard'); },
    get activeToolIndicator() { return document.getElementById('activeToolIndicator'); },
    get uploadHint() { return document.getElementById('uploadHint'); },
    get fileInput() { return document.getElementById('fileInput'); },
    get imageOptions() { return document.getElementById('imageOptions'); },
    get pdfOptions() { return document.getElementById('pdfOptions'); },
    get pdfEditorWorkspace() { return document.getElementById('pdfEditorWorkspace'); },
    get previewSection() { return document.getElementById('previewSection'); },
    get actionButtons() { return document.getElementById('actionButtons'); },
    get processBtn() { return document.getElementById('processActionButton'); },
    get customSizeInput() { return document.getElementById('customSize'); },
    get converterOptions() { return document.getElementById('converterOptions'); },
    get mergerOptions() { return document.getElementById('mergerOptions'); },
    get selectedFilesContainer() { return document.getElementById('selectedFilesContainer'); },
    get fileListLabel() { return document.getElementById('fileListLabel'); }
};
