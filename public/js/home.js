document.addEventListener('DOMContentLoaded', () => {
  // Helper to dynamically build a product card element
  function createProductCard(product, options = {}) {
    const card = document.createElement('article');
    card.className = 'product-card';

    const price = Number(product.price || 0);
    const discountRate = product.discountRate || 0;
    const thumbnailUrl = product.thumbnailUrl || '';
    const name = product.name || '';
    const brand = product.brand || '';

    const formattedPrice = price.toLocaleString() + '원';
    const discountHtml = discountRate ? `<span class="discount-rate">${discountRate}%</span>` : '';
    const rankHtml = options.showRank && options.rankIndex ? `<span class="rank-badge">${options.rankIndex}</span>` : '';

    card.innerHTML = `
      <div class="card-img-wrapper">
        ${rankHtml}
        <img class="product-img" src="${thumbnailUrl}" alt="${name}">
      </div>
      <div class="card-body">
        <span class="brand-name">${brand}</span>
        <h4 class="product-title">${name}</h4>
        <div class="price-info">
          ${discountHtml}
          <span class="price">${formattedPrice}</span>
        </div>
        <div class="stats-row">
          관심 0 · 리뷰 0
        </div>
      </div>
    `;

    // Card click handler to navigate to product.html?id=ID
    card.addEventListener('click', () => {
      window.location.href = `product.html?id=${product.id}`;
    });

    return card;
  }

  // Helper to show empty state when no products are found
  function showEmptyState() {
    const productGrid = document.querySelector('.product-grid');
    if (productGrid) {
      productGrid.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-box-open"></i>
          <p>등록된 상품이 없습니다.</p>
        </div>
      `;
    }
    const rankingRow = document.querySelector('.ranking-cards-row');
    if (rankingRow) {
      rankingRow.innerHTML = `
        <div class="empty-state">
          <p>등록된 상품이 없습니다.</p>
        </div>
      `;
    }
  }

  // Helper to show error state when API request fails
  function showErrorState() {

    const rankingRow = document.querySelector('.ranking-cards-row');
    if (rankingRow) {
      rankingRow.innerHTML = `
        <div class="error-state">
          <p>상품 정보를 불러오는 데 실패했습니다.</p>
        </div>
      `;
    }
  }
  let cachedProducts = [];
  let activeFilteredProducts = [];
  let rankingVisibleCount = 6;
  let productsVisibleCount = 6;

  // Helper to render products into layout elements
  function renderProductsData(products) {
    activeFilteredProducts = products;
    rankingVisibleCount = products.length; // Default to all products

    // Render horizontal list 1 (today's top traded)
    const list1 = document.getElementById('horizontal-list-1');
    if (list1) {
      list1.innerHTML = '';
      products.forEach(product => {
        list1.appendChild(createProductCard(product));
      });
    }

    // Render horizontal list 2 (most noted)
    const list2 = document.getElementById('horizontal-list-2');
    if (list2) {
      list2.innerHTML = '';
      [...products].reverse().forEach(product => {
        list2.appendChild(createProductCard(product));
      });
    }

    // Render ranking products
    const rankingRow = document.querySelector('.ranking-cards-row');
    if (rankingRow) {
      rankingRow.innerHTML = '';
      products.forEach((product, idx) => {
        rankingRow.appendChild(createProductCard(product, { showRank: true, rankIndex: idx + 1 }));
      });
    }

    // Hide the '더보기' button as we are rendering all by default
    const btnRankingMore = document.getElementById('btn-ranking-more');
    if (btnRankingMore) {
      btnRankingMore.style.display = 'none';
    }
  }

  // Load products from /api/products
  async function loadProducts() {
    let apiProducts = [];
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const result = await response.json();
        if (result && result.data && Array.isArray(result.data)) {
          apiProducts = result.data;
        }
      } else {
        console.warn(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to fetch products from API:', error);
    }

    cachedProducts = apiProducts;
    renderProductsData(apiProducts);
  }

  // Call load functions
  loadProducts();


  // Search Overlay Open/Close Logic
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



  // Top Nav Tab Bar Click Logic (FOR ME, 홈, 랭킹, 썸머세일, 와인/맥주...)
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      // Prevent default navigation if href is '#' or equivalent to prevent jumpy page reloads
      if (item.getAttribute('href') === '#') {
        e.preventDefault();
      }
      navItems.forEach(el => el.classList.remove('active'));
      item.classList.add('active');
    });
  });

  // Mouse wheel horizontal scrolling translation for .nav-bar
  const navBar = document.querySelector('.nav-bar');
  if (navBar) {
    navBar.addEventListener('wheel', (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        navBar.scrollLeft += e.deltaY;
      }
    }, { passive: false });
  }

  // Mouse wheel horizontal scrolling for product lists
  const horizontalLists = document.querySelectorAll('.horizontal-product-list');
  horizontalLists.forEach(list => {
    list.addEventListener('wheel', (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        list.scrollLeft += e.deltaY;
      }
    }, { passive: false });
  });

  // Mouse wheel & drag scrolling for .category-grid
  const categoryGrid = document.querySelector('.category-grid');
  if (categoryGrid) {
    // Wheel scroll
    categoryGrid.addEventListener('wheel', (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        categoryGrid.scrollLeft += e.deltaY;
      }
    }, { passive: false });

    // Drag to scroll
    let isDown = false;
    let startX;
    let scrollLeft;

    categoryGrid.addEventListener('mousedown', (e) => {
      isDown = true;
      categoryGrid.style.cursor = 'grabbing';
      startX = e.pageX - categoryGrid.offsetLeft;
      scrollLeft = categoryGrid.scrollLeft;
    });
    categoryGrid.addEventListener('mouseleave', () => {
      isDown = false;
      categoryGrid.style.cursor = 'pointer';
    });
    categoryGrid.addEventListener('mouseup', () => {
      isDown = false;
      categoryGrid.style.cursor = 'pointer';
    });
    categoryGrid.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - categoryGrid.offsetLeft;
      const walk = (x - startX) * 2;
      categoryGrid.scrollLeft = scrollLeft - walk;
    });

    // Disable click navigation for all category items (ui only)
    const categoryCards = categoryGrid.querySelectorAll('.category-card');
    categoryCards.forEach((card) => {
      card.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default link behavior (jumping to top)
        // Additional functional behaviors are disabled here
      });
    });

    // Handle '더보기' button click normally if clicked without dragging
    // The browser natively handles link clicks if drag isn't significantly moving the mouse.
  }

  // Sub Tab Segmented Control (선물 테마, 카테고리, 추천 브랜드) Click Logic
  const pillBtns = document.querySelectorAll('.pill-btn');
  const pillSelector = document.querySelector('.pill-selector');
  if (pillBtns.length > 0 && pillSelector) {
    pillBtns.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        pillBtns.forEach(el => el.classList.remove('active'));
        btn.classList.add('active');
        pillSelector.style.setProperty('--active-index', idx);
      });
    });
  }

  // Real-time Ranking "더보기" (Show More) Click Logic
  const btnRankingMore = document.getElementById('btn-ranking-more');

  if (btnRankingMore) {
    btnRankingMore.addEventListener('click', () => {
      const rankingRow = document.querySelector('.ranking-cards-row');
      if (!rankingRow) return;

      if (rankingVisibleCount >= activeFilteredProducts.length) {
        alert('더 이상 불러올 상품이 없습니다.');
        return;
      }

      // Get the next 9 products
      const nextProducts = activeFilteredProducts.slice(rankingVisibleCount, rankingVisibleCount + 9);
      nextProducts.forEach((product, idx) => {
        rankingRow.appendChild(createProductCard(product, { showRank: true, rankIndex: rankingVisibleCount + idx + 1 }));
      });
      rankingVisibleCount += nextProducts.length;
    });
  }



  // Header 로그인 상태 아이콘: 로그인 여부 확인 후 아이콘/드롭다운 표시
  const loginStatusBtn = document.getElementById('btn-login-status');
  const loginStatusDot = document.getElementById('login-status-dot');
  const loginStatusDropdown = document.getElementById('login-status-dropdown');
  const loginStatusNickname = document.getElementById('login-status-nickname');
  const logoutBtn = document.getElementById('btn-logout');

  let isLoggedIn = false;
  let currentNickname = '';

  async function checkLoginStatus() {
    try {
      const response = await fetch('/api/auth/me', { credentials: 'include' });
      const recTitle = document.getElementById('recommendation-title');

      if (response.ok) {
        const result = await response.json();
        isLoggedIn = true;
        currentNickname = (result.data && result.data.nickname) || '';
        const currentUserId = (result.data && result.data.userId) || '';

        if (loginStatusBtn) loginStatusBtn.classList.add('logged-in');
        if (loginStatusDot) loginStatusDot.hidden = false;

        if (recTitle && currentNickname) {
          recTitle.textContent = `${currentNickname}님을 위한 추천 상품`;
        }
      } else {
        isLoggedIn = false;
        if (loginStatusBtn) loginStatusBtn.classList.remove('logged-in');
        if (loginStatusDot) loginStatusDot.hidden = true;
        if (recTitle) recTitle.textContent = '회원님을 위한 추천 상품';
      }
    } catch (error) {
      console.error('로그인 상태 확인 실패:', error);
      const recTitle = document.getElementById('recommendation-title');
      if (recTitle) recTitle.textContent = '회원님을 위한 추천 상품';
    }
  }

  checkLoginStatus();

  if (loginStatusBtn) {
    loginStatusBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (isLoggedIn) {
        if (loginStatusNickname) loginStatusNickname.textContent = `${currentNickname}님`;
        if (loginStatusDropdown) loginStatusDropdown.hidden = !loginStatusDropdown.hidden;
      } else {
        window.location.href = `login.html?redirect=${encodeURIComponent(window.location.href)}`;
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      } catch (error) {
        console.error('로그아웃 요청 실패:', error);
      }
      window.location.reload();
    });
  }

  // 드롭다운 바깥 클릭 시 닫기
  document.addEventListener('click', (e) => {
    if (!loginStatusDropdown || loginStatusDropdown.hidden) return;
    if (loginStatusBtn && loginStatusBtn.contains(e.target)) return;
    if (loginStatusDropdown.contains(e.target)) return;
    loginStatusDropdown.hidden = true;
  });
});
