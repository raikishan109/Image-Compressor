/**
 * PDF.js Viewer Engine
 * Handles high-quality rendering with dynamic scaling and oversampling.
 */
export const PDFViewer = {
    pdfDoc: null,
    container: null,

    /**
     * Load and render all pages of a PDF
     */
    async render(file, container) {
        // Release resources of previous PDF Doc to prevent memory leaks
        if (this.pdfDoc) {
            try {
                await this.pdfDoc.destroy();
            } catch (e) {
                console.warn('Failed to destroy previous PDF doc:', e);
            }
            this.pdfDoc = null;
        }

        this.container = container;
        this.container.innerHTML = '<div class="loader active"><div class="spinner"></div></div>';

        try {
            // Ensure worker is initialized
            if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            }
            
            const arrayBuffer = await file.arrayBuffer();
            this.pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            this.container.innerHTML = ''; // Clear loader

            for (let pageNum = 1; pageNum <= this.pdfDoc.numPages; pageNum++) {
                await this.renderPage(pageNum);
            }
        } catch (error) {
            console.error('PDF Viewer failed:', error);
            
            // Secure rendering: Use textContent to prevent HTML injection / XSS
            const errorEl = document.createElement('div');
            errorEl.className = 'error-message active';
            errorEl.textContent = `Failed to render PDF: ${error.message}`;
            this.container.innerHTML = '';
            this.container.appendChild(errorEl);
        }
    },

    /**
     * Render an individual page with dynamic scaling and (2x) oversampling
     */
    async renderPage(pageNum) {
        const page = await this.pdfDoc.getPage(pageNum);
        
        // Calculate scaling context
        const padding = 40; 
        const containerWidth = this.container.clientWidth - padding;
        const unscaledViewport = page.getViewport({ scale: 1.0 });
        const dynamicScale = containerWidth / unscaledViewport.width;
        
        // Quality Optimization: Render at 2x resolution then scale display down
        const renderScale = dynamicScale * 2;
        const renderViewport = page.getViewport({ scale: renderScale });
        const displayViewport = page.getViewport({ scale: dynamicScale });

        // 1. Create Layout Structure
        const pageHeader = this.createPageLabel(pageNum, this.pdfDoc.numPages);
        const wrapper = this.createPageWrapper(pageNum, displayViewport);
        const canvas = this.createCanvas(renderViewport, displayViewport);
        const overlay = this.createInteractionOverlay(pageNum);

        // 2. Assembly
        wrapper.appendChild(canvas);
        wrapper.appendChild(overlay);
        this.container.appendChild(pageHeader);
        this.container.appendChild(wrapper);

        // 3. Perform the actual PDF.js render
        await page.render({
            canvasContext: canvas.getContext('2d'),
            viewport: renderViewport
        }).promise;
    },

    // --- DOM Component Creators ---

    createPageLabel(pageNum, total) {
        const el = document.createElement('div');
        el.className = 'pdf-page-label';
        el.textContent = `Page ${pageNum} of ${total}`;
        el.style.cssText = 'color: white; font-size: 0.9rem; margin-top: 2rem; margin-bottom: 0.5rem; opacity: 0.8; font-weight: 600;';
        return el;
    },

    createPageWrapper(pageNum, viewport) {
        const el = document.createElement('div');
        el.className = 'pdf-page-wrapper';
        el.style.cssText = `margin-bottom: 2rem; width: ${viewport.width}px; height: ${viewport.height}px;`;
        el.dataset.page = pageNum;
        return el;
    },

    createCanvas(renderViewport, displayViewport) {
        const el = document.createElement('canvas');
        el.width = renderViewport.width;
        el.height = renderViewport.height;
        el.style.width = `${displayViewport.width}px`;
        el.style.height = `${displayViewport.height}px`;
        el.style.display = 'block';
        return el;
    },

    createInteractionOverlay(pageNum) {
        const el = document.createElement('div');
        el.className = 'pdf-overlay';
        el.dataset.page = pageNum;
        return el;
    }
};
