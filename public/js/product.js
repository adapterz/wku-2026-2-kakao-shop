// 상품 데이터를 화면에 렌더링하는 함수
function renderProduct(product) {
  const imgElement = document.getElementById("product-img");
  const brandElement = document.getElementById("product-brand");
  const nameElement = document.getElementById("product-name");
  const priceElement = document.getElementById("product-price");
  const descElement = document.getElementById("product-description");
  const usageElement = document.getElementById("product-usage");

  if (imgElement) imgElement.src = product.thumbnailUrl;
  if (brandElement) brandElement.textContent = product.brand;
  if (nameElement) nameElement.textContent = product.name;
  if (priceElement) priceElement.textContent = `${product.price.toLocaleString()}원`;
  if (descElement) descElement.textContent = product.description;
  if (usageElement) usageElement.textContent = product.usageInfo;
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

// 로그인 여부를 확인한 뒤, 로그인 상태면 주문 페이지로 이동하고
// 아니면 로그인 페이지로 보내고 로그인 후 돌아올 주소를 함께 넘김
async function goToOrder(productId) {
  try {
    const response = await fetch('/api/auth/me', { credentials: 'include' });
    if (response.ok) {
      window.location.href = `order.html?id=${productId}`;
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

  // 선물하기 / 구매하기 버튼 클릭 시 로그인 여부부터 확인
  const btnGift = document.getElementById('btn-gift');
  const btnBuy = document.getElementById('btn-buy');

  if (btnGift) {
    btnGift.addEventListener('click', () => goToOrder(productId));
  }
  if (btnBuy) {
    btnBuy.addEventListener('click', () => goToOrder(productId));
  }
});

