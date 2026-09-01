// Theme Management Module
import { store } from './state.js';

export function toggleTheme() {
    const newTheme = store.theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    store.theme = newTheme;
}

export function initTheme() {
    setTheme(store.theme);
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
}
