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
});
