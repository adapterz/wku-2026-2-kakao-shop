# 교체 필요 목록 체크리스트

실제 데이터베이스 스키마(`schema.sql`)가 확정되고, DB 연동(M2 2단계 등)을 본격적으로 진행할 때 다음 항목들을 교체/업데이트해야 합니다.

## 파일/모듈 교체 목록

- [ ] `db/models/userModel.js`
  - [ ] `mockUsers` 배열 제거
  - [ ] `getUserByEmail`: 실제 DB 조회 쿼리(`SELECT * FROM users WHERE email = ?`)로 교체
  - [ ] `getUserByNickname`: 실제 DB 조회 쿼리(`SELECT * FROM users WHERE nickname = ?`)로 교체
  - [ ] `createUser`: 실제 DB 데이터 삽입(`INSERT INTO users ...`)으로 교체
  - [ ] 회원가입 시 비밀번호 `bcrypt` 단방향 해시 암호화 로직 추가

- [ ] `db/models/productModel.js`
  - [ ] `mockProducts` 배열 제거
  - [ ] `getProductById`: 실제 DB 조회 쿼리(`SELECT * FROM products WHERE id = ?`)로 교체

## 라우터 보완 목록

- [ ] `routes/auth.js` (`POST /api/auth/login`)
  - [ ] 단순 문자열(`user.password !== password`) 비교 로직을 `bcrypt.compare()` 함수를 활용한 검증 로직으로 변경
  - [ ] 로그인 성공 시, **세션 저장** 로직 또는 JWT 토큰 발급 등 인증 유지 처리를 추가

- [ ] 추후 M2 2단계(인증/인가 보완 및 세션) 진행 시
  - [ ] `POST /api/auth/logout` 엔드포인트 구현
  - [ ] `GET /api/me` 엔드포인트 구현
  - [ ] `requireLogin` 미들웨어 구현 및 필요한 라우터(`orders`, `gifts` 등)에 적용

## 기타 확장 포인트 (이번 범위 외)
- 이후 주문(orders), 선물(gifts) API 개발 시 `db/models/orderModel.js`, `db/models/giftModel.js` 등을 추가 생성하여 DB 접근 계층 분리 패턴을 재사용합니다.
