document.addEventListener("DOMContentLoaded", async () => {
  let currentUser = null;
  let selectedProduct = null;
  let receiverId = null;

  // 1. 로그인 여부 확인
  try {
    const authResponse = await fetch('/api/auth/me', { credentials: 'include' });
    if (!authResponse.ok) {
      alert("로그인이 필요한 서비스입니다.");
      location.href = "login.html";
      return;
    }
    const authResult = await authResponse.json();
    if (authResult && authResult.data) {
      currentUser = authResult.data;
    } else {
      alert("로그인이 필요한 서비스입니다.");
      location.href = "login.html";
      return;
    }
  } catch (error) {
    console.error("인증 확인 실패:", error);
    alert("로그인이 필요한 서비스입니다.");
    location.href = "login.html";
    return;
  }

  // 2. URL 파라미터에서 productId 및 선물 유형(type) 추출
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('productId');
  const orderType = urlParams.get('type') || 'self'; // 'self' or 'gift'

  if (!productId) {
    alert("올바르지 않은 접근입니다.");
    location.href = "index.html";
    return;
  }

  // 3. 주문서 조회 API (상품 상세 정보 조회 API 활용)를 사용하여 상품 정보 조회
  try {
    const productResponse = await fetch(`/api/products/${productId}`, { credentials: 'include' });
    if (!productResponse.ok) {
      throw new Error(`HTTP error! status: ${productResponse.status}`);
    }
    const productResult = await productResponse.json();
    if (productResult && productResult.data) {
      selectedProduct = productResult.data;
      
      // 상품 정보 화면 바인딩
      document.getElementById("order-product-img").src = selectedProduct.thumbnailUrl;
      document.getElementById("order-brand").textContent = selectedProduct.brand;
      document.getElementById("order-name").textContent = selectedProduct.name;
      
      const quantity = Number(urlParams.get('quantity')) || 1;
      const totalPrice = Number(urlParams.get('totalPrice')) || (selectedProduct.price * quantity);
      document.getElementById("order-price").textContent = `${totalPrice.toLocaleString()}원`;
    } else {
      alert("상품 정보를 찾을 수 없습니다.");
      location.href = "index.html";
      return;
    }
  } catch (error) {
    console.error("상품 정보 조회 실패:", error);
    alert("상품 정보를 불러오는 데 실패했습니다.");
    location.href = "index.html";
    return;
  }

  // 4. 선물 유형에 따른 받는 사람 UI 제어
  const receiverSection = document.getElementById("receiver-section");
  const selfReceiverSection = document.getElementById("self-receiver-section");
  const isSelfGift = (orderType === 'self');

  if (isSelfGift) {
    selfReceiverSection.style.display = "block";
    receiverId = currentUser.userId; // 나에게 선물하기는 받는 사람이 나 자신
  } else {
    receiverSection.style.display = "block";
    
    // 받는 사람 검색 로직
    const searchUserBtn = document.getElementById("btn-search-user");
    const nicknameInput = document.getElementById("receiver-nickname-input");
    const searchResultDiv = document.getElementById("receiver-search-result");

    searchUserBtn.addEventListener("click", async () => {
      const nickname = nicknameInput.value.trim();
      if (!nickname) {
        alert("검색할 닉네임을 입력해 주세요.");
        return;
      }

      try {
        const userSearchResponse = await fetch(`/api/users/search?nickname=${encodeURIComponent(nickname)}`, { credentials: 'include' });
        if (!userSearchResponse.ok) {
          searchResultDiv.style.color = "red";
          searchResultDiv.textContent = "사용자를 찾을 수 없습니다.";
          receiverId = null;
          return;
        }

        const userSearchResult = await userSearchResponse.json();
        if (userSearchResult && userSearchResult.data) {
          const foundUser = userSearchResult.data;
          searchResultDiv.style.color = "green";
          searchResultDiv.textContent = `선택된 대상: ${foundUser.nickname}`;
          receiverId = foundUser.userId;
        } else {
          searchResultDiv.style.color = "red";
          searchResultDiv.textContent = "사용자를 찾을 수 없습니다.";
          receiverId = null;
        }
      } catch (error) {
        console.error("사용자 검색 실패:", error);
        searchResultDiv.style.color = "red";
        searchResultDiv.textContent = "검색 중 오류가 발생했습니다.";
        receiverId = null;
      }
    });
  }

  // 5. 결제 및 주문 생성 로직
  const submitOrderBtn = document.getElementById("btn-submit-order");
  const messageInput = document.getElementById("message-input");

  submitOrderBtn.addEventListener("click", async () => {
    if (!receiverId) {
      alert("받는 사람을 지정해 주세요.");
      return;
    }

    const requestBody = {
      productId: Number(productId),
      message: messageInput.value.trim() || null,
      isSelfGift: isSelfGift,
      receiverId: Number(receiverId)
    };

    try {
      submitOrderBtn.disabled = true;
      submitOrderBtn.textContent = "결제 진행 중...";

      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        credentials: 'include'
      });

      const orderResult = await orderResponse.json();

      if (orderResponse.ok && orderResult.code === "ORDER_CREATE_SUCCESS") {
        location.href = "complete.html";
      } else {
        alert(orderResult.message || "주문에 실패했습니다. 다시 시도해 주세요.");
        submitOrderBtn.disabled = false;
        submitOrderBtn.textContent = "결제하기";
      }
    } catch (error) {
      console.error("주문 생성 실패:", error);
      alert("네트워크 오류가 발생했습니다. 다시 시도해 주세요.");
      submitOrderBtn.disabled = false;
      submitOrderBtn.textContent = "결제하기";
    }
  });
});
