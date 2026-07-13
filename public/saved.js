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
    const savedProducts = JSON.parse(localStorage.getItem('saved_products') || '[]');
    const emptyState = document.getElementById('saved-empty-state');
    const itemsList = document.getElementById('saved-items-list');

    if (savedProducts.length === 0) {
        // 저장된 상품이 없으면 빈 상태 표시
        emptyState.style.display = 'block';
        itemsList.style.display = 'none';
    } else {
        // 저장된 상품이 있으면 리스트 컨테이너 표시 (목록 UI 구현 전이므로 컨테이너만 보이게 처리)
        emptyState.style.display = 'none';
        itemsList.style.display = 'block';
    }
});
