// ============================================================
// controllers/authController.js - 인증 관련 비즈니스 로직
// ============================================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ── 관리자 로그인 처리 ─────────────────────────────────────
// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. 요청 본문 유효성 검사
    if (!email || !password) {
      return res.status(400).json({ message: '이메일과 비밀번호를 모두 입력해 주세요.' });
    }

    // 2. DB에서 해당 이메일의 사용자 조회
    const user = await User.findOne({ email });

    // 사용자가 존재하지 않는 경우 (보안을 위해 구체적인 이유를 알려주지 않음)
    if (!user) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    // 3. 비밀번호 비교 (bcrypt를 사용하여 해시 비교)
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    // 4. JWT 토큰 생성
    // payload: 토큰에 담을 정보 (비밀번호 등 민감 정보는 절대 포함 금지!)
    const payload = {
      userId: user._id,
      name: user.name,
      role: user.role,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,      // .env의 비밀 키로 서명
      { expiresIn: '7d' }          // 토큰 만료 기간: 7일
    );

    // 5. 로그인 성공 응답
    res.status(200).json({
      message: '로그인 성공!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    console.error('로그인 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// ── 회원가입 처리 ──────────────────────────────────────────
// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. 필수 필드 유효성 검사
    if (!name || !email || !password) {
      return res.status(400).json({ message: '이름, 이메일, 비밀번호를 모두 입력해 주세요.' });
    }

    // 2. 비밀번호 최소 길이 검사
    if (password.length < 6) {
      return res.status(400).json({ message: '비밀번호는 6자 이상이어야 합니다.' });
    }

    // 3. 이미 존재하는 이메일인지 확인
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: '이미 사용 중인 이메일입니다.' });
    }

    // 4. 새 사용자 생성 (role은 기본값 'member', 비밀번호는 pre-save hook에서 자동 해시화)
    const newUser = new User({ name, email, password, role: 'member' });
    await newUser.save();

    res.status(201).json({ message: '회원가입이 완료되었습니다!', userId: newUser._id });

  } catch (err) {
    console.error('회원가입 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};
