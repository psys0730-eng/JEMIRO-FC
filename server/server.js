// ============================================================
// server.js - 서버의 메인 진입점 (Entry Point)
// ============================================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// .env 파일의 환경 변수를 process.env로 불러옵니다.
dotenv.config();

const app = express();

// ── 미들웨어 설정 ──────────────────────────────────────────
// JSON 형식의 요청 본문(body)을 파싱할 수 있도록 설정
app.use(express.json());

// CORS 설정: React 클라이언트(3000번 포트)에서의 요청을 허용
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);

// ── 라우터 연결 ────────────────────────────────────────────
const authRoutes = require('./routes/auth');
const scheduleRoutes  = require('./routes/schedules');
const settingsRoutes  = require('./routes/settings');

// '/api/auth' 로 시작하는 모든 요청은 authRoutes 가 처리
app.use('/api/auth', authRoutes);

// '/api/schedules' 로 시작하는 모든 요청은 scheduleRoutes 가 처리
app.use('/api/schedules', scheduleRoutes);

// '/api/settings' 로 시작하는 모든 요청은 settingsRoutes 가 처리
app.use('/api/settings', settingsRoutes);

// ── 기본 상태 확인 라우트 ──────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: '⚽ JEMIRO-FC 서버가 정상 작동 중입니다!' });
});

// ── MongoDB Atlas 연결 및 서버 시작 ───────────────────────
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Atlas 연결 성공!');
    app.listen(PORT, () => {
      console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB 연결 실패:', err.message);
    process.exit(1); // 연결 실패 시 서버 종료
  });
