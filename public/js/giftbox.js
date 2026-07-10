document.addEventListener("DOMContentLoaded", () => {
  const tabUnused = document.getElementById("tab-unused");
  const tabUsed = document.getElementById("tab-used");
  const listContainer = document.getElementById("gift-list-container");

  let currentStatus = 'unused';

  // Load gifts
  const loadGifts = async (status) => {
    currentStatus = status;
    updateTabStyles();
    
    if (status === 'unused') {
      listContainer.innerHTML = `<div class="empty-state">미사용 선물이 없습니다.</div>`;
      return;
    }
    
    try {
      const response = await fetch(`/api/gifts?status=${status}`, { credentials: 'include' });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          alert("로그인이 필요합니다.");
          location.href = "login.html";
          return;
        }
        throw new Error("Failed to load gifts");
      }
      
      const result = await response.json();
      renderGiftList(result.data || []);
    } catch (error) {
      console.error("선물함 조회 실패:", error);
      listContainer.innerHTML = `<div class="empty-state">선물 목록을 불러오지 못했습니다.</div>`;
    }
  };

  const updateTabStyles = () => {
    if (currentStatus === 'unused') {
      tabUnused.classList.add('active');
      tabUsed.classList.remove('active');
    } else {
      tabUsed.classList.add('active');
      tabUnused.classList.remove('active');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  };

  const renderGiftList = (gifts) => {
    listContainer.innerHTML = "";
    
    if (gifts.length === 0) {
      listContainer.innerHTML = `<div class="empty-state">${currentStatus === 'unused' ? '미사용 선물이 없습니다.' : '사용완료 선물이 없습니다.'}</div>`;
      return;
    }

    gifts.forEach(gift => {
      const card = document.createElement("div");
      card.className = "gift-card";
      
      // Click event for unused gifts
      if (currentStatus === 'unused') {
        card.addEventListener('click', () => {
          location.href = `giftuse.html?giftId=${gift.giftId}`;
        });
      }

      const isUsed = (currentStatus === 'used');
      const senderText = gift.isSelfGift ? "나" : (gift.senderNickname || "친구");
      const dateText = isUsed && gift.usedAt ? `사용일: ${formatDate(gift.usedAt)}` : `받은일: ${formatDate(gift.createdAt)}`;

      card.innerHTML = `
        <div class="gift-img-wrapper">
          <img src="${gift.thumbnailUrl || ''}" alt="상품 썸네일" class="gift-img">
          ${isUsed ? '<div class="used-overlay">사용완료</div>' : ''}
        </div>
        <div class="gift-info">
          <div class="gift-brand">${gift.brand || ''}</div>
          <div class="gift-name">${gift.productName || ''}</div>
          <div class="gift-sender-info">
            <span>보낸사람: ${senderText}</span>
            <span class="gift-date">${dateText}</span>
          </div>
        </div>
      `;
      listContainer.appendChild(card);
    });
  };

  // Tab Events
  tabUnused.addEventListener('click', () => loadGifts('unused'));
  tabUsed.addEventListener('click', () => loadGifts('used'));

  // Init
  loadGifts('unused');
});
