// tools/registry.js

const JPG_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
const PNG_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>';
const WEBP_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
const BULK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="13" height="13" x="9" y="9" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/><path d="M13 13h5v5"/></svg>';
const PDF_COMPRESS_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/></svg>';
const EDIT_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
const CONVERT_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/></svg>';
const MERGE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4"/><path d="M16 2h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4"/><path d="M12 6v12"/><path d="m9 15 3 3 3-3"/><path d="m9 9 3-3 3 3"/></svg>';

export const TOOLS = {
    'JPG COMPRESSOR': {
        type: 'image',
        accept: 'image/jpeg',
        icon: JPG_ICON,
        color: '#e11d48',
        hint: 'Supports JPG/JPEG images',
        label: 'JPG Compressor',
        description: 'Compress JPG images to custom sizes'
    },
    'PNG COMPRESSOR': {
        type: 'image',
        accept: 'image/png',
        icon: PNG_ICON,
        color: '#0284c7',
        hint: 'Supports PNG images',
        label: 'PNG Compressor',
        description: 'Reduce PNG size while maintaining quality'
    },
    'WEBP COMPRESSOR': {
        type: 'image',
        accept: 'image/webp',
        icon: WEBP_ICON,
        color: '#059669',
        hint: 'Supports WEBP images',
        label: 'WEBP Compressor',
        description: 'Efficiently compress WEBP images'
    },
    'BULK COMPRESS': {
        type: 'image',
        accept: 'image/jpeg,image/png,image/webp',
        icon: BULK_ICON,
        color: '#7c3aed',
        hint: 'Compress images in bulk',
        label: 'Bulk Compress',
        description: 'Compress multiple images at once'
    },
    'PDF COMPRESSOR': {
        type: 'pdf',
        accept: 'application/pdf',
        icon: PDF_COMPRESS_ICON,
        color: '#dc2626',
        hint: 'Supports PDF documents',
        label: 'PDF Compressor',
        description: 'Reduce PDF file size by up to 80% while maintaining quality'
    },
    'PDF EDITOR': {
        type: 'pdf',
        accept: 'application/pdf',
        icon: EDIT_ICON,
        color: '#ea580c',
        hint: 'Modify your PDF documents',
        label: 'PDF Editor',
        description: 'Edit, draw, and modify text in PDF documents'
    },
    'IMAGE CONVERTER': {
        type: 'image',
        accept: 'image/jpeg,image/png,image/webp',
        icon: CONVERT_ICON,
        color: '#0d9488',
        hint: 'Convert between JPG, PNG, and WEBP',
        label: 'Image Converter',
        description: 'Convert between JPG, PNG, and WEBP formats'
    },
    'MERGE PDF': {
        type: 'pdf',
        accept: 'application/pdf',
        icon: MERGE_ICON,
        color: '#4f46e5',
        hint: 'Combine multiple PDFs into one',
        label: 'Merge PDF',
        description: 'Combine multiple PDF files into a single document'
    }
};

export const SECTIONS = {
    dashboard: {
        title: 'KBify Image Suite',
        subtitle: 'Choose a tool to start compressing your images'
    },
    image: {
        title: 'KBify Image Suite',
        subtitle: 'Choose an image tool to start compressing'
    },
    pdf: {
        title: 'KBify Document Suite',
        subtitle: 'Choose a document tool to start compressing'
    }
};
