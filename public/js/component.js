document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    if (navItems.length === 0) return;

    let currentPath = window.location.pathname;
    let currentFile = currentPath.substring(currentPath.lastIndexOf('/') + 1);
    
    // Default to index.html if root path
    if (currentFile === '' || currentFile === '/') {
        currentFile = 'index.html';
    }

    navItems.forEach(item => {
        // Handle click for placeholder links so they feel responsive
        item.addEventListener('click', (e) => {
            let href = item.getAttribute('href');
            if (!href || href === '#') {
                e.preventDefault();
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
            }
        });

        let href = item.getAttribute('href');
        if (!href || href === '#') {
            item.classList.remove('active');
            return;
        }

        // Parse href to get filename, ignoring query strings
        let hrefFile = href;
        const qIndex = href.indexOf('?');
        if (qIndex !== -1) hrefFile = href.substring(0, qIndex);
        hrefFile = hrefFile.substring(hrefFile.lastIndexOf('/') + 1);

        if (currentFile === hrefFile) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
});
