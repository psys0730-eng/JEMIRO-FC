// ============================================================
// pages/DashboardPage.jsx - 로그인 후 메인 대시보드
// ============================================================

import './DashboardPage.css'

/**
 * DashboardPage 컴포넌트
 * @param {Object} user       - 로그인한 유저 정보 { name, email, role }
 * @param {Function} onLogout - 로그아웃 콜백 (App.jsx에서 전달)
 */
function DashboardPage({ user, onLogout }) {

  // ── 로그아웃 처리 ─────────────────────────────────────
  const handleLogout = () => {
    // LocalStorage에서 토큰과 유저 정보 삭제
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    // App.jsx에 로그아웃 알림 → 로그인 화면으로 전환
    onLogout()
  }

  return (
    <div className="dashboard-wrapper">

      {/* 상단 헤더 */}
      <header className="dashboard-header">
        <div className="header-logo">
          <span>⚽</span>
          JEMIRO-FC
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          로그아웃
        </button>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="dashboard-main">

        {/* 환영 배너 */}
        <div className="welcome-banner">
          <span className="welcome-emoji">🎉</span>
          <h2>{user?.name || '관리자'}님, 환영합니다!</h2>
          <p>JEMIRO-FC 회비 관리 시스템에 로그인했습니다.</p>
        </div>

        {/* 준비 중인 기능 카드들 */}
        <div className="coming-soon">
          <div className="coming-soon-card">
            <span className="card-icon">👥</span>
            <div>
              <h3>회원 관리</h3>
              <p>팀원 목록 조회 및 관리</p>
            </div>
            <span className="badge">준비 중</span>
          </div>

          <div className="coming-soon-card">
            <span className="card-icon">💰</span>
            <div>
              <h3>회비 관리</h3>
              <p>납부 현황 및 미납자 확인</p>
            </div>
            <span className="badge">준비 중</span>
          </div>

          <div className="coming-soon-card">
            <span className="card-icon">📊</span>
            <div>
              <h3>정산 내역</h3>
              <p>수입/지출 통계 및 내역</p>
            </div>
            <span className="badge">준비 중</span>
          </div>

          <div className="coming-soon-card">
            <span className="card-icon">📅</span>
            <div>
              <h3>경기 일정</h3>
              <p>다음 모임 일정 관리</p>
            </div>
            <span className="badge">준비 중</span>
          </div>
        </div>

      </main>
    </div>
  )
}

export default DashboardPage
