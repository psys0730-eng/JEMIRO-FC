// ============================================================
// routes/settings.js - 설정 라우터
// ============================================================

const express = require('express');
const router = express.Router();
const { getSettings, updateBalance } = require('../controllers/settingsController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// GET  /api/settings          → 설정 조회 (로그인 사용자)
router.get('/', protect, getSettings);

// PATCH /api/settings/balance → 잔액 수정 (관리자만)
router.patch('/balance', protect, adminOnly, updateBalance);

module.exports = router;
