// ============================================================
// controllers/settingsController.js - 앱 설정 API 로직
// ============================================================

const Settings = require('../models/Settings');

// ── GET /api/settings ───────────────────────────────────────
// 전역 설정(잔액 포함) 조회 (로그인한 모든 회원 가능)
exports.getSettings = async (req, res) => {
  try {
    // key: 'global' 로 조회, 없으면 기본값으로 자동 생성
    const settings = await Settings.findOneAndUpdate(
      { key: 'global' },
      { $setOnInsert: { key: 'global' } },
      { new: true, upsert: true }
    );
    res.status(200).json({ settings });
  } catch (err) {
    console.error('설정 조회 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// ── PATCH /api/settings/balance ─────────────────────────────
// 통장 잔액 수정 (관리자만 가능)
exports.updateBalance = async (req, res) => {
  try {
    const { balance, balanceMemo } = req.body;

    // 숫자 유효성 검사
    if (balance === undefined || balance === null || isNaN(Number(balance))) {
      return res.status(400).json({ message: '올바른 금액을 입력해 주세요.' });
    }
    if (Number(balance) < 0) {
      return res.status(400).json({ message: '금액은 0원 이상이어야 합니다.' });
    }

    const settings = await Settings.findOneAndUpdate(
      { key: 'global' },
      {
        balance: Number(balance),
        balanceMemo: balanceMemo || '',
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      message: '잔액이 업데이트되었습니다.',
      settings,
    });
  } catch (err) {
    console.error('잔액 수정 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};
