document.addEventListener('DOMContentLoaded', () => {
  // Helper to dynamically build a product card element
  function createProductCard(product, options = {}) {
    const card = document.createElement('article');
    card.className = 'product-card';

    const price = Number(product.price || 0);
    const discountRate = product.discountRate || 0;
    const wishCount = product.wishCount || 0;
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
        <div class="card-actions-row">
          <button class="btn-action-bag-only" aria-label="선물상자에 담기">
            <i class="fa-solid fa-bag-shopping"></i>
          </button>
          <div class="btn-action-wish-row">
            <i class="fa-regular fa-heart"></i>
            <span class="wish-count">${Number(wishCount || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>
    `;

    // Wishlist click handler
    const wishBtn = card.querySelector('.btn-action-wish-row');
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

        let countText = countSpan.textContent.replace(/,/g, '');
        let currentCount = parseInt(countText, 10) || 0;
        if (wishBtn.classList.contains('active')) {
          currentCount += 1;
        } else {
          currentCount = Math.max(0, currentCount - 1);
        }
        countSpan.textContent = currentCount.toLocaleString();
      });
    }

    // Shopping Bag click handler
    const bagBtn = card.querySelector('.btn-action-bag-only');
    if (bagBtn) {
      bagBtn.addEventListener('click', () => {
        alert('선물상자에 상품이 추가되었습니다!');
      });
    }

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
    const productGrid = document.querySelector('.product-grid');
    if (productGrid) {
      productGrid.innerHTML = `
        <div class="error-state">
          <i class="fa-solid fa-circle-exclamation"></i>
          <p>상품 정보를 불러오는 데 실패했습니다.<br>잠시 후 다시 시도해 주세요.</p>
        </div>
      `;
    }
    const rankingRow = document.querySelector('.ranking-cards-row');
    if (rankingRow) {
      rankingRow.innerHTML = `
        <div class="error-state">
          <p>상품 정보를 불러오는 데 실패했습니다.</p>
        </div>
      `;
    }
  }

  // Helper to render products into layout elements
  function renderProductsData(products) {
    if (!products || products.length === 0) {
      showEmptyState();
      return;
    }

    // Render recommended products (3-column grid)
    const productGrid = document.querySelector('.product-grid');
    if (productGrid) {
      productGrid.innerHTML = '';
      products.forEach(product => {
        productGrid.appendChild(createProductCard(product));
      });
    }

    // Render ranking products (horizontal list, first 3 items)
    const rankingRow = document.querySelector('.ranking-cards-row');
    if (rankingRow) {
      rankingRow.innerHTML = '';
      products.slice(0, 3).forEach((product, idx) => {
        rankingRow.appendChild(createProductCard(product, { showRank: true, rankIndex: idx + 1 }));
      });
    }
  }

  // Load products from /api/products
  async function loadProducts() {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      
      if (!result || typeof result !== 'object') {
        throw new Error('Invalid JSON response format');
      }
      if (!('data' in result)) {
        throw new Error('Response payload is missing "data" property');
      }
      if (!Array.isArray(result.data)) {
        throw new Error('Response "data" property is not an array');
      }
      
      renderProductsData(result.data);
    } catch (error) {
      console.error('Failed to fetch products from API:', error);
      showErrorState();
    }
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

  // Segment Target Filter Click Logic (모두가, 여성이, 남성이, 청소년이)
  const segmentItems = document.querySelectorAll('.segment-item');
  segmentItems.forEach(item => {
    item.addEventListener('click', () => {
      segmentItems.forEach(el => el.classList.remove('active'));
      item.classList.add('active');
    });
  });

  // Rank Filter Tabs Click Logic (받고 싶어한, 많이 선물한, 위시로 받은)
  const rankFilterTabs = document.querySelectorAll('.rank-filter-tab');
  rankFilterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      rankFilterTabs.forEach(el => el.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  // Price Filter Pills Click Logic (1만원 미만, 1만원대, 2만원대...)
  const pricePills = document.querySelectorAll('.price-pill');
  pricePills.forEach(pill => {
    pill.addEventListener('click', () => {
      pricePills.forEach(el => el.classList.remove('active'));
      pill.classList.add('active');
    });
  });

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
});
