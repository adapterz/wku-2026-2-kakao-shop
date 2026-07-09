document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('signup-form');
  const errorEl = document.getElementById('signup-error');
  const submitBtn = form ? form.querySelector('.btn-auth-submit') : null;

  const ERROR_MESSAGES = {
    REQUIRED_EMAIL: '이메일을 입력해주세요.',
    REQUIRED_PASSWORD: '비밀번호를 입력해주세요.',
    REQUIRED_NICKNAME: '닉네임을 입력해주세요.',
    EMAIL_ALREADY_EXISTS: '이미 가입된 이메일입니다.',
    NICKNAME_ALREADY_EXISTS: '이미 사용 중인 닉네임입니다.',
    INTERNAL_SERVER_ERROR: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
  };

  function showError(message) {
    if (!errorEl) return;
    errorEl.textContent = message;
    errorEl.hidden = false;
  }

  function clearError() {
    if (!errorEl) return;
    errorEl.hidden = true;
    errorEl.textContent = '';
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearError();

      const email = form.email.value.trim();
      const password = form.password.value;
      const nickname = form.nickname.value.trim();

      if (submitBtn) submitBtn.disabled = true;

      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, nickname })
        });

        const result = await response.json();

        if (response.ok && result.code === 'SIGNUP_SUCCESS') {
          alert('회원가입이 완료되었습니다. 로그인해주세요.');
          window.location.href = 'login.html';
          return;
        }

        showError(ERROR_MESSAGES[result.code] || '회원가입에 실패했습니다.');
      } catch (error) {
        console.error('회원가입 요청 실패:', error);
        showError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  // Search Overlay Open/Close Logic (공통 UI, home.js와 동일 패턴)
  const searchOpenBtn = document.getElementById('btn-search-open');
  const searchCloseBtn = document.getElementById('btn-search-close');
  const searchOverlay = document.getElementById('search-overlay');
  const searchInput = searchOverlay ? searchOverlay.querySelector('.search-overlay-input') : null;

  if (searchOpenBtn && searchCloseBtn && searchOverlay) {
    searchOpenBtn.addEventListener('click', (e) => {
      e.preventDefault();
      searchOverlay.classList.add('open');
      if (searchInput) {
        setTimeout(() => searchInput.focus(), 50);
      }
    });

    searchCloseBtn.addEventListener('click', () => {
      searchOverlay.classList.remove('open');
    });
  }
});
