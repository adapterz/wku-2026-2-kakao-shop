const express = require('express');
const router = express.Router();

// API 명세서에 맞춘 더미 데이터
const dummyProducts = [
  {
    id: 1,
    name: "익산역 아메리카노 교환권",
    brand: "익산역점",
    price: 4500,
    thumbnailUrl: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=150&auto=format&fit=crop&q=60",
    thumbnail_url: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=150&auto=format&fit=crop&q=60",
    discountRate: 10,
    discount_rate: 10,
    wishCount: 1530,
    wish_count: 1530
  },
  {
    id: 2,
    name: "카카오 프렌즈 머그컵",
    brand: "카카오프렌즈",
    price: 15000,
    thumbnailUrl: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=150&auto=format&fit=crop&q=60",
    thumbnail_url: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=150&auto=format&fit=crop&q=60",
    discountRate: 0,
    discount_rate: 0,
    wishCount: 420,
    wish_count: 420
  }
];

// 상품 목록 조회
router.get('/', (req, res) => {
  res.status(200).json({
    status: 200,
    code: "PRODUCT_LIST_SUCCESS",
    message: null,
    data: dummyProducts
  });
});

module.exports = router;
