const express = require('express');
const router = express.Router();
const userModel = require('../db/models/userModel'); // 추가된 모델 (스텁)

// POST /api/auth/signup - 회원가입 (M2 1단계 라우터 골격)
router.post('/signup', async (req, res) => {
  try {
    const { email, password, nickname } = req.body;

    // 1. 유효성 검사 (입력값 확인)
    if (!email) {
      return res.status(400).json({ status: 400, code: "REQUIRED_EMAIL", message: "이메일은 필수입니다.", data: null });
    }
    if (!password) {
      return res.status(400).json({ status: 400, code: "REQUIRED_PASSWORD", message: "비밀번호는 필수입니다.", data: null });
    }
    if (!nickname) {
      return res.status(400).json({ status: 400, code: "REQUIRED_NICKNAME", message: "닉네임은 필수입니다.", data: null });
    }

    // 2. 중복 검사 (DB 접근 - 스텁 함수 호출)
    const existingEmail = await userModel.getUserByEmail(email);
    if (existingEmail) {
      return res.status(409).json({ status: 409, code: "EMAIL_ALREADY_EXISTS", message: "이미 사용 중인 이메일입니다.", data: null });
    }

    const existingNickname = await userModel.getUserByNickname(nickname);
    if (existingNickname) {
      return res.status(409).json({ status: 409, code: "NICKNAME_ALREADY_EXISTS", message: "이미 사용 중인 닉네임입니다.", data: null });
    }

    // 3. 실제 로직: 사용자 생성 (TODO: DB 연동 시 실제 insert 및 password bcrypt 암호화 적용 필요)
    const newUser = await userModel.createUser(email, password, nickname);

    // 4. 성공 응답 (DB 필드 -> API 응답 필드 변환 계층)
    return res.status(201).json({
      status: 201,
      code: "SIGNUP_SUCCESS",
      message: null,
      data: {
        userId: newUser.id,
        email: newUser.email,
        nickname: newUser.nickname,
        createdAt: newUser.created_at
      }
    });

  } catch (error) {
    console.error('Error in POST /api/auth/signup:', error);
    res.status(500).json({ status: 500, code: "INTERNAL_SERVER_ERROR", message: "서버 에러가 발생했습니다.", data: null });
  }
});

// POST /api/auth/login - 로그인 (M2 1단계 라우터 골격)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. 유효성 검사
    if (!email) {
      return res.status(400).json({ status: 400, code: "REQUIRED_EMAIL", message: "이메일은 필수입니다.", data: null });
    }
    if (!password) {
      return res.status(400).json({ status: 400, code: "REQUIRED_PASSWORD", message: "비밀번호는 필수입니다.", data: null });
    }

    // 2. 실제 로직: 사용자 조회 (DB 접근 - 스텁 함수 호출)
    const user = await userModel.getUserByEmail(email);

    // 3. 비밀번호 확인 (TODO: DB 연동 시 bcrypt.compare 로직으로 교체 필요)
    // 현재는 단순 문자열 비교 (스텁 데이터 확인용)
    if (!user || user.password !== password) {
      return res.status(401).json({ status: 401, code: "INVALID_EMAIL_OR_PASSWORD", message: "이메일 또는 비밀번호가 올바르지 않습니다.", data: null });
    }

    // 4. TODO: 세션/토큰 생성 (M2 2단계 항목이므로 이번 범위에서는 제외)

    // 5. 성공 응답 (DB 필드 -> API 응답 필드 변환 계층)
    return res.status(200).json({
      status: 200,
      code: "LOGIN_SUCCESS",
      message: null,
      data: {
        userId: user.id,
        email: user.email,
        nickname: user.nickname
      }
    });

  } catch (error) {
    console.error('Error in POST /api/auth/login:', error);
    res.status(500).json({ status: 500, code: "INTERNAL_SERVER_ERROR", message: "서버 에러가 발생했습니다.", data: null });
  }
});

module.exports = router;
