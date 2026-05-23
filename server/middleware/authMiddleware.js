// ============================================================
// middleware/authMiddleware.js - JWT 인증 미들웨어
// ============================================================
// 이후 회비 조회/수정 등 인증이 필요한 API에 사용합니다.
// 예시: router.get('/fees', protect, getFees);
// ============================================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // 요청 헤더에서 Bearer 토큰 추출
  // Authorization: Bearer <token>
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: '인증 토큰이 없습니다. 로그인이 필요합니다.' });
  }

  try {
    // 토큰 검증 및 payload 디코딩
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // DB에서 사용자 정보를 조회하여 req.user에 저장 (이후 라우트에서 사용 가능)
    req.user = await User.findById(decoded.userId).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: '해당 토큰의 사용자를 찾을 수 없습니다.' });
    }

    next(); // 다음 미들웨어 또는 라우트 핸들러로 이동
  } catch (err) {
    return res.status(401).json({ message: '토큰이 유효하지 않거나 만료되었습니다.' });
  }
};

// 관리자(총무)만 접근 가능하도록 제한하는 미들웨어
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: '관리자 권한이 필요합니다.' });
  }
};

module.exports = { protect, adminOnly };
