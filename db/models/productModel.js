// TODO: 실제 쿼리로 교체 필요
// 실제 DB의 schema.sql이 확정/적용되면 mock 데이터를 제거하고 실제 DB 쿼리를 실행하도록 변경해야 합니다.

const mockProducts = [
  {
    id: 1,
    name: "카카오프렌즈 인형",
    brand: "카카오프렌즈",
    price: 15000,
    thumbnail_url: "https://example.com/image.jpg",
    description: "카카오프렌즈의 귀여운 인형입니다.",
    usage_info: "발급일로부터 30일 이내 사용 가능"
  }
];

const getProductById = async (id) => {
  // 스텁: DB 조회 로직 대체
  // 실제 DB 컬럼명(snake_case) 기준, ERD 참고
  const productId = Number(id);
  const product = mockProducts.find(p => p.id === productId);
  
  if (!product) return null;

  return product;
};

module.exports = {
  getProductById
};
