document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const giftId = urlParams.get('giftId');

    if (!giftId) {
        alert("잘못된 접근입니다.");
        location.href = 'giftbox.html';
        return;
    }

    const btnUse = document.getElementById('btn-use');

    try {
        // 상세 조회 API 호출
        // 서버에 GET /api/gifts/:id 가 있다고 가정하고 호출합니다.
        const response = await fetch(`/api/gifts/${giftId}`, { credentials: 'include' });
        
        if (!response.ok) {
            // 만약 서버에 단건 조회 API가 아직 구현되어 있지 않다면
            // 전체 목록을 가져와서 해당 giftId를 찾는 Fallback 처리
            const allGiftsResponse = await fetch('/api/gifts?status=unused', { credentials: 'include' });
            if (allGiftsResponse.ok) {
                const result = await allGiftsResponse.json();
                const gift = result.data.find(g => String(g.giftId) === String(giftId));
                if (gift) {
                    renderGift(gift);
                } else {
                    alert('선물 정보를 불러오지 못했거나 이미 사용된 선물입니다.');
                    location.href = 'giftbox.html';
                }
            } else {
                alert('선물 정보를 불러오지 못했습니다.');
                location.href = 'giftbox.html';
            }
        } else {
            const result = await response.json();
            renderGift(result.data);
        }
    } catch (err) {
        console.error(err);
        alert("오류가 발생했습니다.");
        location.href = 'giftbox.html';
    }

    btnUse.addEventListener('click', async () => {
        if (!confirm("선물을 사용하시겠습니까? 사용 후에는 취소할 수 없습니다.")) return;

        try {
            btnUse.disabled = true;
            btnUse.textContent = "처리중...";

            // 사용 처리 API 호출 (gifts.status 변경, used_at 기록)
            const useRes = await fetch(`/api/gifts/${giftId}/use`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (!useRes.ok) {
                throw new Error("API 요청 실패");
            }

            alert("사용 처리가 완료되었습니다.");
            
            // 처리 완료 후 사용완료 탭으로 이동
            location.href = 'giftbox.html?tab=used';
            
        } catch (err) {
            console.error(err);
            alert("사용 처리에 실패했습니다. 서버 API 구현 여부를 확인해주세요.");
            btnUse.disabled = false;
            btnUse.textContent = "내 앨범에 저장";
        }
    });
});

function renderGift(gift) {
    if (gift.status === 'USED') {
        alert("이미 사용 완료된 선물입니다.");
        location.href = 'giftbox.html?tab=used';
        return;
    }

    // 닉네임 / 나 배지 처리
    document.getElementById('receiver-nickname').textContent = gift.isSelfGift ? "나" : (gift.senderNickname || "친구");
    if (gift.isSelfGift) {
        document.getElementById('self-badge').style.display = 'block';
    } else {
        document.getElementById('self-badge').style.display = 'none';
    }

    // 상품 정보
    document.getElementById('product-img').src = gift.thumbnailUrl || '';
    document.getElementById('product-brand').textContent = gift.brand || '';
    document.getElementById('product-name').textContent = gift.productName || '';

    // 바코드 처리
    // 실제 서버 응답에 barcode 필드가 있으면 사용하고, 없으면 더미 바코드 출력
    const barcodeVal = gift.barcode || "2350978230953538";
    
    // 4자리씩 띄어쓰기 포맷팅 (예: 2350 9782 3095 3538)
    const formatted = barcodeVal.replace(/(\d{4})(?=\d)/g, '$1 ');
    document.getElementById('barcode-text').textContent = formatted;
}
