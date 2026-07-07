const express = require('express');
const router = express.Router();

// API 명세서에 맞춘 더미 데이터
const dummyProducts = [
  {
    id: 1,
    name: "익산역 아메리카노 교환권",
    brand: "익산역점",
    price: 4500,
    thumbnailUrl: "https://via.placeholder.com/150"
  },
  {
    id: 2,
    name: "카카오 프렌즈 머그컵",
    brand: "카카오프렌즈",
    price: 15000,
    thumbnailUrl: "https://via.placeholder.com/150"
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
