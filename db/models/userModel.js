// TODO: 실제 쿼리로 교체 필요
// 실제 DB의 schema.sql이 확정/적용되면 mock 데이터를 제거하고 실제 DB 쿼리를 실행하도록 변경해야 합니다.

// 스텁용 mock 데이터 배열 (ERD 기준: users 테이블)
const mockUsers = [
  {
    id: 1,
    email: "test@example.com",
    password: "password123", // 실제 구현에서는 bcrypt 해시값 저장
    nickname: "testuser",
    created_at: "2023-01-01T00:00:00Z"
  }
];

let nextUserId = 2;

const getUserByEmail = async (email) => {
  // 스텁 로직: DB의 SELECT * FROM users WHERE email = ? 쿼리 대체
  return mockUsers.find(u => u.email === email) || null;
};

const getUserByNickname = async (nickname) => {
  // 스텁 로직: DB의 SELECT * FROM users WHERE nickname = ? 쿼리 대체
  return mockUsers.find(u => u.nickname === nickname) || null;
};

const createUser = async (email, password, nickname) => {
  // 스텁 로직: DB의 INSERT INTO users ... 쿼리 대체
  const newUser = {
    id: nextUserId++,
    email,
    password, // TODO: M2 2단계(실제 로그인/회원가입 완성)에서 bcrypt 해싱 적용 예정
    nickname,
    created_at: new Date().toISOString()
  };
  mockUsers.push(newUser);
  return newUser;
};

module.exports = {
  getUserByEmail,
  getUserByNickname,
  createUser
};
