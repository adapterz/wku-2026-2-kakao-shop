// 상품 데이터를 화면에 렌더링하는 함수
function renderProduct(product) {
  const imgElement = document.getElementById("product-img");
  const brandElement = document.getElementById("product-brand");
  const nameElement = document.getElementById("product-name");
  const priceElement = document.getElementById("product-price");
  const descElement = document.getElementById("product-description");
  const usageElement = document.getElementById("product-usage");
  const brandNavElement = document.getElementById("product-brand-nav");

  if (imgElement) imgElement.src = product.thumbnailUrl;
  if (brandElement) brandElement.textContent = product.brand;
  if (nameElement) nameElement.textContent = product.name;
  if (priceElement) priceElement.textContent = `${product.price.toLocaleString()}원`;
  if (descElement) descElement.textContent = product.description;
  if (usageElement) usageElement.textContent = product.usageInfo;
  if (brandNavElement) brandNavElement.textContent = product.brand;
}

// API로부터 상품 상세 데이터 가져오기
async function loadProductDetail(id) {
  try {
    const response = await fetch(`/api/products/${id}`, { credentials: 'include' });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    if (result && result.data) {
      renderProduct(result.data);
    }
  } catch (error) {
    console.error("상품 상세 데이터를 불러오는 데 실패했습니다:", error);
  }
}

async function goToOrder(productId, type) {
  try {
    const response = await fetch('/api/auth/me', { credentials: 'include' });
    if (response.ok) {
      window.location.href = `order.html?productId=${productId}&type=${type}`;
    } else {
      const redirectTarget = encodeURIComponent(window.location.href);
      window.location.href = `login.html?redirect=${redirectTarget}`;
    }
  } catch (error) {
    console.error('로그인 상태 확인 실패:', error);
    window.location.href = 'login.html';
  }
}

// DOM이 로드된 후 데이터 로드 실행
document.addEventListener("DOMContentLoaded", () => {
  // URL 쿼리 파라미터에서 상품 ID 추출 (기본값 1)
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id') || 1;

  loadProductDetail(productId);

  // 검색 오버레이 열기/닫기 로직
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

  // 위시리스트 토글 로직
  const wishBtn = document.getElementById('btn-wish');
  if (wishBtn) {
    wishBtn.addEventListener('click', () => {
      const icon = wishBtn.querySelector('i');
      const countSpan = wishBtn.querySelector('.wish-count');
      wishBtn.classList.toggle('active');

      if (wishBtn.classList.contains('active')) {
        icon.classList.remove('fa-regular');
        icon.classList.add('fa-solid');
      } else {
        icon.classList.remove('fa-solid');
        icon.classList.add('fa-regular');
      }

      let currentCount = parseInt(countSpan.textContent || '0', 10) || 0;
      if (wishBtn.classList.contains('active')) {
        currentCount += 1;
      } else {
        currentCount = Math.max(0, currentCount - 1);
      }
      countSpan.textContent = currentCount;
    });
  }

  // 나에게 선물하기 및 선물하기 버튼 클릭 시 로그인 상태를 먼저 확인하고 주문 페이지로 이동
  const buyBtn = document.querySelector('.btn-bottom-buy');
  
  // Bottom Sheet open/close and drag/swipe logic
  const bottomSheetOverlay = document.getElementById('bottom-sheet-overlay');
  const bottomSheet = document.getElementById('bottom-sheet');
  const bottomSheetHeader = document.getElementById('bottom-sheet-header');

  const openBottomSheet = () => {
    if (!bottomSheetOverlay || !bottomSheet) return;
    bottomSheetOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      bottomSheet.style.transform = 'translateY(0)';
    }, 10);
  };

  const closeBottomSheet = () => {
    if (!bottomSheetOverlay || !bottomSheet) return;
    bottomSheet.style.transform = 'translateY(100%)';
    document.body.style.overflow = '';
    setTimeout(() => {
      bottomSheetOverlay.classList.remove('active');
    }, 250);
  };

  if (buyBtn) {
    buyBtn.addEventListener('click', () => {
      openBottomSheet();
    });
  }

  if (bottomSheetOverlay && bottomSheet) {
    // dim area click
    bottomSheetOverlay.addEventListener('click', (e) => {
      if (e.target === bottomSheetOverlay) {
        closeBottomSheet();
      }
    });

    let startY = 0;
    let currentY = 0;
    let isDragging = false;
    let startTime = 0;

    const startDrag = (y) => {
      startY = y;
      currentY = y;
      isDragging = true;
      startTime = Date.now();
      bottomSheet.style.transition = 'none';
    };

    const drag = (y) => {
      if (!isDragging) return;
      currentY = y;
      const deltaY = currentY - startY;
      if (deltaY > 0) {
        bottomSheet.style.transform = `translateY(${deltaY}px)`;
      }
    };

    const endDrag = () => {
      if (!isDragging) return;
      isDragging = false;
      bottomSheet.style.transition = 'transform 0.25s cubic-bezier(0.25, 0.8, 0.25, 1)';
      
      const deltaY = currentY - startY;
      const elapsedTime = Date.now() - startTime;
      const velocity = deltaY / elapsedTime;

      // Close if dragged down more than 100px OR swiped fast (velocity > 0.4)
      if (deltaY > 100 || velocity > 0.4) {
        closeBottomSheet();
      } else {
        bottomSheet.style.transform = 'translateY(0)';
      }
    };

    // Drag events for header
    if (bottomSheetHeader) {
      bottomSheetHeader.addEventListener('mousedown', (e) => startDrag(e.clientY));
      bottomSheetHeader.addEventListener('touchstart', (e) => {
        startDrag(e.touches[0].clientY);
      }, { passive: true });
    }

    // Move and End events on window to handle release outside the header
    window.addEventListener('mousemove', (e) => {
      if (isDragging) drag(e.clientY);
    });
    window.addEventListener('mouseup', () => {
      if (isDragging) endDrag();
    });

    window.addEventListener('touchmove', (e) => {
      if (isDragging) {
        drag(e.touches[0].clientY);
      }
    }, { passive: false });

    window.addEventListener('touchend', () => {
      if (isDragging) endDrag();
    });
  }

  const giftBtn = document.querySelector('.btn-bottom-gift');
  if (giftBtn) {
    giftBtn.addEventListener('click', () => {
      goToOrder(productId, 'gift');
    });
  }
});
