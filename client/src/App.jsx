// ============================================================
// App.jsx - 앱 최상위 컴포넌트
// 화면 상태: 'login' | 'signup' | 'main' | 'admin'
// ============================================================

import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import MainDashboard from './pages/MainDashboard'
import AdminPage from './pages/AdminPage'

function App() {
  // ── 인증 상태 ─────────────────────────────────────────────
  const savedUser = localStorage.getItem('user')
  const [user, setUser] = useState(savedUser ? JSON.parse(savedUser) : null)

  // ── 현재 화면: 'login' | 'signup' | 'main' | 'admin' ────
  const [screen, setScreen] = useState('main')

  // ── 콜백 함수들 ──────────────────────────────────────────

  const handleLoginSuccess = (userData) => {
    setUser(userData)
    setScreen('main')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setScreen('login')
  }

  const handleSignupSuccess = () => setScreen('login')

  // ── 화면 분기 ────────────────────────────────────────────

  // 로그인된 상태
  if (user) {
    // 관리자 페이지
    if (screen === 'admin') {
      return (
        <AdminPage
          user={user}
          onGoBack={() => setScreen('main')}
          onLogout={handleLogout}
        />
      )
    }
    // 메인 대시보드
    return (
      <MainDashboard
        user={user}
        onLogout={handleLogout}
        onGoAdmin={() => setScreen('admin')}  // 관리자 페이지 이동 콜백
      />
    )
  }

  // 회원가입
  if (screen === 'signup') {
    return (
      <SignupPage
        onGoLogin={() => setScreen('login')}
        onSignupSuccess={handleSignupSuccess}
      />
    )
  }

  // 로그인 (기본)
  return (
    <LoginPage
      onLoginSuccess={handleLoginSuccess}
      onGoSignup={() => setScreen('signup')}
    />
  )
}

export default App
