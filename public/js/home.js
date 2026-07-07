document.addEventListener('DOMContentLoaded', () => {
  // Helper to dynamically build a product card element
  function createProductCard(product, options = {}) {
    const card = document.createElement('article');
    card.className = 'product-card';

    const formattedPrice = Number(product.price || 0).toLocaleString() + '원';
    const discountHtml = product.discountRate ? `<span class="discount-rate">${product.discountRate}%</span>` : '';
    const rankHtml = options.showRank && options.rankIndex ? `<span class="rank-badge">${options.rankIndex}</span>` : '';

    card.innerHTML = `
      <div class="card-img-wrapper">
        ${rankHtml}
        <img class="product-img" src="${product.image || product.imageUrl || ''}" alt="${product.name || product.title || ''}">
      </div>
      <div class="card-body">
        <span class="brand-name">${product.brand || product.brandName || ''}</span>
        <h4 class="product-title">${product.name || product.title || ''}</h4>
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
            <span class="wish-count">${Number(product.wishCount || 0).toLocaleString()}</span>
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

  const FALLBACK_PRODUCTS = [
    {
      "id": 1,
      "brand": "익산역 커피",
      "name": "아이스 아메리카노 교환권",
      "price": 4500,
      "discountRate": 0,
      "image": "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=300&auto=format&fit=crop&q=80",
      "wishCount": 150
    },
    {
      "id": 2,
      "brand": "익산역 커피",
      "name": "아이스 바닐라 라떼 교환권",
      "price": 5200,
      "discountRate": 0,
      "image": "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=300&auto=format&fit=crop&q=80",
      "wishCount": 230
    },
    {
      "id": 3,
      "brand": "익산역 디저트",
      "name": "마카롱 6구 세트",
      "price": 15000,
      "discountRate": 0,
      "image": "https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=300&auto=format&fit=crop&q=80",
      "wishCount": 180
    },
    {
      "id": 4,
      "brand": "익산역 디저트",
      "name": "소금빵 4종 세트",
      "price": 12900,
      "discountRate": 10,
      "image": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&auto=format&fit=crop&q=80",
      "wishCount": 95
    },
    {
      "id": 5,
      "brand": "익산역마켓",
      "name": "10,000원 금액권",
      "price": 10000,
      "discountRate": 0,
      "image": "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300&auto=format&fit=crop&q=80",
      "wishCount": 140
    },
    {
      "id": 6,
      "brand": "익산역마켓",
      "name": "30,000원 금액권",
      "price": 30000,
      "discountRate": 0,
      "image": "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300&auto=format&fit=crop&q=80",
      "wishCount": 310
    }
  ];

  // Helper to render products into layout elements
  function renderProductsData(products) {
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
    if (rankingRow && products.length > 0) {
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
      if (!response.ok) throw new Error('Network response was not ok');
      const products = await response.json();
      renderProductsData(products);
    } catch (error) {
      console.warn('Failed to fetch products from API, rendering fallback Iksan local partners data instead:', error);
      renderProductsData(FALLBACK_PRODUCTS);
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
