document.addEventListener('DOMContentLoaded', () => {
    // 탭 클릭 활성화 로직
    const tabs = document.querySelectorAll('.saved-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            tabs.forEach(t => {
                t.classList.remove('active');
                t.style.fontWeight = 'normal';
                t.style.color = '#767676';
                t.style.borderBottom = 'none';
            });
            tab.classList.add('active');
            tab.style.fontWeight = 'bold';
            tab.style.color = '#191919';
            tab.style.borderBottom = '2px solid #191919';
        });
    });

    // 로컬 스토리지에서 저장된 상품 확인 및 빈 상태 표시
    const emptyState = document.getElementById('saved-empty-state');
    const itemsList = document.getElementById('saved-items-list');

    async function fetchAndRenderSavedProducts() {
        let savedProductsIds = JSON.parse(localStorage.getItem('saved_products') || '[]');
        if (savedProductsIds.length === 0) {
            emptyState.style.display = 'block';
            itemsList.style.display = 'none';
            return;
        }

        try {
            const response = await fetch('/api/products');
            if (!response.ok) throw new Error('API fetch error');
            const result = await response.json();
            const allProducts = result.data || [];
            
            // Reverse so newly added items might appear depending on preference, but here we just filter
            const savedItems = [];
            // To maintain chronological order (oldest first), we iterate forwards
            for (let i = 0; i < savedProductsIds.length; i++) {
                const found = allProducts.find(p => p.id.toString() === savedProductsIds[i]);
                if (found) savedItems.push(found);
            }
            
            if (savedItems.length === 0) {
                emptyState.style.display = 'block';
                itemsList.style.display = 'none';
            } else {
                emptyState.style.display = 'none';
                itemsList.style.display = 'block';
                renderSavedItems(savedItems);
            }
        } catch (error) {
            console.error('Failed to load products:', error);
            emptyState.style.display = 'block';
            itemsList.style.display = 'none';
        }
    }

    function renderSavedItems(products) {
        itemsList.innerHTML = '';
        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'saved-card';
            card.innerHTML = `
                <div class="saved-card-img-wrapper" style="cursor: pointer;">
                    <img class="saved-card-img" src="${product.thumbnailUrl}" alt="${product.name}">
                </div>
                <div class="saved-card-info">
                    <div class="saved-card-top">
                        <div class="saved-card-text" style="cursor: pointer;">
                            <div class="saved-card-brand">${product.brand}</div>
                            <div class="saved-card-name">${product.name}</div>
                        </div>
                        <button class="btn-remove-saved" data-id="${product.id}" title="저장 해제">
                            <i class="fa-solid fa-bookmark"></i>
                        </button>
                    </div>
                    <div class="saved-card-price">${product.price.toLocaleString()}원</div>
                </div>
            `;

            // 상품 클릭 시 상세 페이지 이동
            const clickAreas = card.querySelectorAll('.saved-card-img-wrapper, .saved-card-text');
            clickAreas.forEach(area => {
                area.addEventListener('click', () => {
                    window.location.href = `product.html?id=${product.id}`;
                });
            });

            // 저장 해제 로직
            const removeBtn = card.querySelector('.btn-remove-saved');
            removeBtn.addEventListener('click', () => {
                let savedIds = JSON.parse(localStorage.getItem('saved_products') || '[]');
                savedIds = savedIds.filter(id => id !== product.id.toString());
                localStorage.setItem('saved_products', JSON.stringify(savedIds));
                
                card.remove();
                
                // 만약 모든 항목이 삭제되었다면 빈 상태 표시
                if (itemsList.children.length === 0) {
                    emptyState.style.display = 'block';
                    itemsList.style.display = 'none';
                }
            });

            itemsList.appendChild(card);
        });
    }

    fetchAndRenderSavedProducts();
});
