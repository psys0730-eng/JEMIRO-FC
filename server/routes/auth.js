// ============================================================
// routes/auth.js - 인증 관련 라우트 정의
// ============================================================

const express = require('express');
const router = express.Router();
const { login, register } = require('../controllers/authController');

// POST /api/auth/login   → 관리자 로그인
router.post('/login', login);

// POST /api/auth/register → 관리자 계정 초기 등록 (개발/테스트용)
// ⚠️ 배포 시 이 라인을 주석 처리하거나 삭제하세요.
router.post('/register', register);

module.exports = router;
