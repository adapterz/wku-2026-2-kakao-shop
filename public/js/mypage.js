document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/auth/me', { credentials: 'include' });
        
        if (!response.ok) {
            if (response.status === 401) {
                // Not logged in, redirect to login page
                window.location.href = 'login.html';
            } else {
                console.error('Failed to fetch user info');
            }
            return;
        }

        const resData = await response.json();
        
        if (resData && resData.data) {
            const user = resData.data;
            const nicknameEl = document.getElementById('display-nickname');
            const useridEl = document.getElementById('display-userid');
            
            if (nicknameEl) nicknameEl.textContent = user.nickname || 'Unknown';
            if (useridEl) useridEl.textContent = user.userId;
        } else {
            console.error('No user data in response');
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }

    // Settings Overlay Logic
    const settingsBtn = document.querySelector('.icon-btn[aria-label="설정"]');
    const settingsOverlay = document.getElementById('settings-overlay');
    const settingsCloseBtn = document.getElementById('btn-settings-close');

    if (settingsBtn && settingsOverlay && settingsCloseBtn) {
        settingsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            settingsOverlay.classList.add('open');
        });

        settingsCloseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            settingsOverlay.classList.remove('open');
        });
    }

    // Search Overlay Logic
    const searchCloseBtn = document.getElementById('btn-search-close');
    const searchOverlayElement = document.getElementById('search-overlay');
    
    if (searchCloseBtn && searchOverlayElement) {
        searchCloseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            searchOverlayElement.classList.remove('show');
            searchOverlayElement.classList.remove('open');
        });
    }
});
