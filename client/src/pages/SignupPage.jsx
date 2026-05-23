// ============================================================
// pages/SignupPage.jsx - 회원가입 화면
// 입력: 이름 / 이메일 / 비밀번호 / 비밀번호 확인
// ============================================================

import { useState } from 'react'
import { registerAPI } from '../api/auth'
import './LoginPage.css'   // 로그인 페이지와 공통 스타일 재사용
import './SignupPage.css'  // 회원가입 추가 스타일

/**
 * SignupPage 컴포넌트
 * @param {Function} onGoLogin    - 로그인 화면으로 이동하는 콜백
 * @param {Function} onSignupSuccess - 가입 성공 후 콜백 (자동 로그인 or 로그인 유도)
 */
function SignupPage({ onGoLogin, onSignupSuccess }) {
  const [name, setName]               = useState('')
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError]             = useState('')
  const [success, setSuccess]         = useState('')
  const [loading, setLoading]         = useState(false)

  // ── 회원가입 제출 ────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // ① 클라이언트 유효성 검사
    if (!name || !email || !password || !passwordConfirm) {
      setError('모든 항목을 입력해 주세요.')
      return
    }
    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.')
      return
    }
    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    setLoading(true)
    try {
      // ② 백엔드 API 호출 (POST /api/auth/register)
      await registerAPI(name, email, password)

      // ③ 가입 성공 → 성공 메시지 표시 후 로그인 화면 이동
      setSuccess('🎉 회원가입 완료! 로그인 화면으로 이동합니다...')
      setTimeout(() => {
        onSignupSuccess()  // 로그인 화면으로 전환
      }, 1800)

    } catch (err) {
      const msg = err.response?.data?.message || '회원가입에 실패했습니다. 다시 시도해 주세요.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-card signup-card">

        {/* 로고 */}
        <div className="login-logo">
          <span className="logo-icon">⚽</span>
          <h1>JEMIRO-FC</h1>
          <p>새 계정 만들기</p>
        </div>

        {/* 회원가입 폼 */}
        <form className="login-form" onSubmit={handleSubmit}>

          {/* 이름 */}
          <div className="input-group">
            <label htmlFor="name">이름</label>
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input
                id="name"
                type="text"
                placeholder="홍길동"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          {/* 이메일 */}
          <div className="input-group">
            <label htmlFor="email">이메일</label>
            <div className="input-wrapper">
              <span className="input-icon">✉️</span>
              <input
                id="email"
                type="email"
                placeholder="example@jemiro.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          {/* 비밀번호 */}
          <div className="input-group">
            <label htmlFor="password">비밀번호</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                id="password"
                type="password"
                placeholder="6자 이상 입력"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* 비밀번호 확인 */}
          <div className="input-group">
            <label htmlFor="passwordConfirm">비밀번호 확인</label>
            <div className="input-wrapper">
              {/* 일치 여부에 따라 아이콘 색상 변경 */}
              <span className="input-icon">
                {passwordConfirm.length === 0 ? '🔒' : password === passwordConfirm ? '✅' : '❌'}
              </span>
              <input
                id="passwordConfirm"
                type="password"
                placeholder="비밀번호를 다시 입력"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
              />
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="error-box">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* 성공 메시지 */}
          {success && (
            <div className="success-box">
              <span>{success}</span>
            </div>
          )}

          {/* 가입 버튼 */}
          <button
            type="submit"
            className={`login-btn ${loading ? 'loading' : ''}`}
            disabled={loading || !!success}
          >
            {loading ? '처리 중...' : '회원가입'}
          </button>
        </form>

        {/* 로그인 화면으로 이동 */}
        <p className="switch-link">
          이미 계정이 있으신가요?{' '}
          <button type="button" className="link-btn" onClick={onGoLogin}>
            로그인
          </button>
        </p>
      </div>
    </div>
  )
}

export default SignupPage
