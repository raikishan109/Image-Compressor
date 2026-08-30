// tools/registry.js

const IMAGE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
const UPLOAD_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>';
const DOC_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>';
const COMPRESS_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14h6v6M10 14l-6 6M20 10h-6V4M14 10l6-6"/></svg>';
const BULK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';
const FAST_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.34 19a10 10 0 1 1 17.32 0"/><path d="M12 14V8"/><circle cx="12" cy="14" r="2"/></svg>';
const EDIT_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
const DOWNLOAD_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v10m0 0l-4-4m4 4l4-4M5 20h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"/></svg>';
const CONVERT_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/></svg>';
const MERGE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M9 15h6"/><path d="M12 12v6"/></svg>';

export const TOOLS = {
    'JPG COMPRESSOR': {
        type: 'image',
        accept: 'image/jpeg',
        icon: UPLOAD_ICON,
        color: '#ff4d4d',
        hint: 'Supports JPG/JPEG images',
        label: 'JPG Compressor',
        description: 'Compress JPG images to custom sizes'
    },
    'PNG COMPRESSOR': {
        type: 'image',
        accept: 'image/png',
        icon: IMAGE_ICON,
        color: '#3b82f6',
        hint: 'Supports PNG images',
        label: 'PNG Compressor',
        description: 'Reduce PNG size while maintaining quality'
    },
    'WEBP COMPRESSOR': {
        type: 'image',
        accept: 'image/webp',
        icon: DOWNLOAD_ICON,
        color: '#10b981',
        hint: 'Supports WEBP images',
        label: 'WEBP Compressor',
        description: 'Efficiently compress WEBP images'
    },
    'BULK COMPRESS': {
        type: 'image',
        accept: 'image/jpeg,image/png,image/webp',
        icon: BULK_ICON,
        color: '#8b5cf6',
        hint: 'Compress images in bulk',
        label: 'Bulk Compress',
        description: 'Compress multiple images at once'
    },
    'FAST SQUEEZE': {
        type: 'image',
        accept: 'image/jpeg,image/png,image/webp',
        icon: FAST_ICON,
        color: '#f59e0b',
        hint: 'Optimized fast compression',
        label: 'Fast Squeeze',
        description: 'Instant compression with optimized preset'
    },
    'PDF COMPRESSOR': {
        type: 'pdf',
        accept: 'application/pdf',
        icon: DOC_ICON,
        color: '#ef4444',
        hint: 'Supports PDF documents',
        label: 'PDF Compressor',
        description: 'Reduce PDF file size by up to 80% while maintaining quality'
    },
    'PDF EDITOR': {
        type: 'pdf',
        accept: 'application/pdf',
        icon: EDIT_ICON,
        color: '#f59e0b',
        hint: 'Modify your PDF documents',
        label: 'PDF Editor',
        description: 'Edit, draw, and modify text in PDF documents'
    },
    'IMAGE CONVERTER': {
        type: 'image',
        accept: 'image/jpeg,image/png,image/webp',
        icon: CONVERT_ICON,
        color: '#10b981',
        hint: 'Convert between JPG, PNG, and WEBP',
        label: 'Image Converter',
        description: 'Convert between JPG, PNG, and WEBP formats'
    },
    'MERGE PDF': {
        type: 'pdf',
        accept: 'application/pdf',
        icon: MERGE_ICON,
        color: '#8b5cf6',
        hint: 'Combine multiple PDFs into one',
        label: 'Merge PDF',
        description: 'Combine multiple PDF files into a single document'
    }
};

export const SECTIONS = {
    dashboard: {
        title: 'KBIFY ULTIMATE SUITE',
        subtitle: 'Choose a tool to start compressing your files'
    },
    image: {
        title: 'KBIFY IMAGE SUITE',
        subtitle: 'Choose an image tool to start compressing'
    },
    pdf: {
        title: 'KBIFY DOCUMENT SUITE',
        subtitle: 'Choose a document tool to start compressing'
    }
};
