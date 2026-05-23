// ============================================================
// pages/LoginPage.jsx - 관리자 로그인 화면
// ============================================================

import { useState } from 'react'
import { loginAPI } from '../api/auth'
import './LoginPage.css'
import './SignupPage.css'  // switch-link, link-btn 공유

/**
 * LoginPage 컴포넌트
 * @param {Function} onLoginSuccess - 로그인 성공 시 App.jsx에서 받은 콜백
 */
function LoginPage({ onLoginSuccess, onGoSignup }) {
  // ── 상태 관리 ──────────────────────────────────────────
  const [email, setEmail]       = useState('')      // 이메일 입력값
  const [password, setPassword] = useState('')      // 비밀번호 입력값
  const [error, setError]       = useState('')      // 에러 메시지
  const [loading, setLoading]   = useState(false)   // 로딩 상태

  // ── 로그인 제출 핸들러 ─────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()   // 폼 기본 동작(페이지 새로고침) 막기
    setError('')         // 이전 에러 초기화

    // 간단한 클라이언트 유효성 검사
    if (!email || !password) {
      setError('이메일과 비밀번호를 모두 입력해 주세요.')
      return
    }

    setLoading(true)

    try {
      // 백엔드 로그인 API 호출 (POST /api/auth/login)
      const data = await loginAPI(email, password)

      // ✅ 로그인 성공: JWT 토큰을 LocalStorage에 저장
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      // App.jsx로 성공 알림 → 대시보드로 전환
      onLoginSuccess(data.user)

    } catch (err) {
      // 서버 응답 에러 메시지 표시, 없으면 기본 메시지
      const msg = err.response?.data?.message || '로그인에 실패했습니다. 다시 시도해 주세요.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // ── 렌더링 ─────────────────────────────────────────────
  return (
    <div className="login-wrapper">
      <div className="login-card">

        {/* 로고 영역 */}
        <div className="login-logo">
          <span className="logo-icon">⚽</span>
          <h1>JEMIRO-FC</h1>
          <p>축구모임 회비 관리 시스템</p>
        </div>

        {/* 로그인 폼 */}
        <form className="login-form" onSubmit={handleSubmit}>

          {/* 이메일 입력 */}
          <div className="input-group">
            <label htmlFor="email">이메일</label>
            <div className="input-wrapper">
              <span className="input-icon">✉️</span>
              <input
                id="email"
                type="email"
                placeholder="admin@jemiro.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          {/* 비밀번호 입력 */}
          <div className="input-group">
            <label htmlFor="password">비밀번호</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                id="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
          </div>

          {/* 에러 메시지 (에러가 있을 때만 렌더링) */}
          {error && (
            <div className="error-box">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* 로그인 버튼 */}
          <button
            type="submit"
            className={`login-btn ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        {/* 하단: 회원가입 이동 링크 */}
        <p className="switch-link">
          아직 계정이 없으신가요?{' '}
          <button type="button" className="link-btn" onClick={onGoSignup}>
            회원가입
          </button>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
