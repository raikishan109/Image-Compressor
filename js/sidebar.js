// Sidebar Management Module

export function toggleSidebar() {
    if (window.innerWidth > 1024) return;

    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}
