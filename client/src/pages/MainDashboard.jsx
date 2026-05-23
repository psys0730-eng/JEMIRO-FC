// ============================================================
// pages/MainDashboard.jsx
// 구조: [헤더] → [잔액카드] → [Swiper: 다가오는경기 | 캘린더]
// ============================================================

import { useState, useEffect } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

import { getSchedulesAPI, voteScheduleAPI } from '../api/schedules'
import { getSettingsAPI } from '../api/settings'
import BalanceCard from '../components/BalanceCard'
import './MainDashboard.css'

const DAYS = ['일', '월', '화', '수', '목', '금', '토']

const fmtDate = (dateStr) => {
  const d = new Date(dateStr)
  return {
    short: `${d.getMonth() + 1}월 ${d.getDate()}일`,
    day:   DAYS[d.getDay()] + '요일',
  }
}

const isSameDay = (a, b) => {
  const da = new Date(a), db = new Date(b)
  return da.getFullYear() === db.getFullYear() &&
         da.getMonth()    === db.getMonth()    &&
         da.getDate()     === db.getDate()
}

function MainDashboard({ user, onLogout, onGoAdmin }) {
  const [schedules,    setSchedules]    = useState([])
  const [settings,     setSettings]     = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [voting,       setVoting]       = useState(null)

  // ── 데이터 로딩 ──────────────────────────────────────────
  useEffect(() => {
    Promise.all([getSchedulesAPI(), getSettingsAPI()])
      .then(([sched, sett]) => { setSchedules(sched); setSettings(sett) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    onLogout()
  }

  // ── 투표 처리 ────────────────────────────────────────────
  const handleVote = async (id, status) => {
    setVoting(id + status)
    try {
      const result = await voteScheduleAPI(id, status)
      setSchedules(prev => prev.map(s =>
        s._id === id ? { ...s, votes: result.votes } : s
      ))
    } catch (err) {
      alert(err.response?.data?.message || '투표 중 오류가 발생했습니다.')
    } finally { setVoting(null) }
  }

  // ── 계산 ─────────────────────────────────────────────────
  const now        = new Date()
  const nextMatch  = schedules.find(s => !s.isCompleted && new Date(s.date) >= now)
  const matchDates = schedules.map(s => new Date(s.date))
  const selectedDayMatches = schedules.filter(s => isSameDay(s.date, selectedDate))

  const myVote     = (schedule) =>
    schedule?.votes?.find(v => v.name === user?.name)?.status

  const voteCount  = (schedule, status) =>
    schedule?.votes?.filter(v => v.status === status).length ?? 0

  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null
    return matchDates.some(d => isSameDay(d, date)) ? <span className="match-dot" /> : null
  }

  // ── 렌더링 ──────────────────────────────────────────────
  return (
    <div className="dashboard-page">

      {/* ── 헤더 ── */}
      <header className="dash-header">
        <div className="dash-logo"><span className="ball">⚽</span>JEMIRO-FC</div>
        <div className="dash-header-actions">
          {user?.role === 'admin' && (
            <button className="dash-admin-btn" onClick={onGoAdmin}>⚙️ 관리자</button>
          )}
          <button className="dash-logout" onClick={handleLogout}>로그아웃</button>
        </div>
      </header>

      {/* ── Swiper: 슬라이드1=다가오는경기, 슬라이드2=달력 ── */}
      <Swiper
        modules={[Pagination]}
        pagination={{ clickable: true }}
        slidesPerView={1}
        autoHeight={true}
        className="main-swiper"
      >

        {/* ════════ 슬라이드 1: 다가오는 경기 + 투표 ════════ */}
        <SwiperSlide>
          <p className="slide-label">⚡ 다가오는 경기</p>

          {loading ? (
            <div className="loading-wrap"><div className="spinner" /><span>불러오는 중...</span></div>
          ) : nextMatch ? (
            <div className="next-match-card">

              {/* 경기 종류 태그 */}
              <div className="match-tag">🏆 {nextMatch.matchType}</div>

              {/* 날짜 */}
              <div className="match-date-big">{fmtDate(nextMatch.date).short}</div>
              <div className="match-day">{fmtDate(nextMatch.date).day}</div>

              {/* 시간 · 장소 */}
              <div className="match-info-grid">
                <div className="match-info-row">
                  <span className="info-icon">🕐</span>
                  <strong>{nextMatch.time}</strong>
                </div>
                <div className="match-info-row">
                  <span className="info-icon">📍</span>
                  <strong>{nextMatch.location}</strong>
                </div>
                {nextMatch.memo && (
                  <div className="match-info-row">
                    <span className="info-icon">📝</span>
                    <span>{nextMatch.memo}</span>
                  </div>
                )}
              </div>

              {/* ── 투표 섹션 ── */}
              {!nextMatch.isCompleted && (
                <div className="vote-section">
                  <p className="vote-title">참가 여부를 알려주세요!</p>

                  {/* 투표 집계 바 */}
                  <div className="vote-bar-wrap">
                    <div className="vote-bar-label">
                      <span>✅ 참가 {voteCount(nextMatch, 'attend')}명</span>
                      <span>❌ 불참 {voteCount(nextMatch, 'absent')}명</span>
                    </div>
                    {nextMatch.votes?.length > 0 && (
                      <div className="vote-bar-track">
                        <div
                          className="vote-bar-fill"
                          style={{
                            width: `${Math.round(
                              (voteCount(nextMatch, 'attend') / nextMatch.votes.length) * 100
                            )}%`
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* 투표 버튼 */}
                  <div className="vote-btns">
                    <button
                      className={`vote-btn attend ${myVote(nextMatch) === 'attend' ? 'active' : ''}`}
                      onClick={() => handleVote(nextMatch._id, 'attend')}
                      disabled={!!voting}
                    >
                      {voting === nextMatch._id + 'attend' ? '...' : '✅ 참가'}
                      {myVote(nextMatch) === 'attend' && <span className="my-vote-badge">내 투표</span>}
                    </button>
                    <button
                      className={`vote-btn absent ${myVote(nextMatch) === 'absent' ? 'active' : ''}`}
                      onClick={() => handleVote(nextMatch._id, 'absent')}
                      disabled={!!voting}
                    >
                      {voting === nextMatch._id + 'absent' ? '...' : '❌ 불참'}
                      {myVote(nextMatch) === 'absent' && <span className="my-vote-badge">내 투표</span>}
                    </button>
                  </div>

                  {/* 투표자 이름 목록 */}
                  {nextMatch.votes?.length > 0 && (
                    <div className="vote-names">
                      {['attend', 'absent'].map(status => {
                        const list = nextMatch.votes.filter(v => v.status === status)
                        if (!list.length) return null
                        return (
                          <div key={status} className={`vote-name-group ${status}`}>
                            <span className="vng-label">{status === 'attend' ? '참가' : '불참'}</span>
                            {list.map(v => (
                              <span key={v.name} className="vng-name">{v.name}</span>
                            ))}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* 완료된 경기 배지 */}
              {nextMatch.isCompleted && (
                <div className="completed-badge">✅ 완료된 경기입니다</div>
              )}
            </div>
          ) : (
            <div className="no-match-card">
              <div className="empty-icon">📭</div>
              <h3>예정된 경기가 없어요</h3>
              <p>관리자가 일정을 등록하면 여기에 표시됩니다.</p>
            </div>
          )}
        </SwiperSlide>

        {/* ════════ 슬라이드 2: 월간 달력 ════════ */}
        <SwiperSlide>
          <p className="slide-label">📅 월간 경기 일정</p>

          <div className="calendar-wrap">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              locale="ko-KR"
              tileContent={tileContent}
              formatDay={(_, date) => date.getDate()}
            />
          </div>

          <div className="selected-day-matches">
            <h4>{selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 경기</h4>
            {selectedDayMatches.length > 0 ? (
              selectedDayMatches.map(match => (
                <div key={match._id} className="match-list-item">
                  <span className="match-type-pill">{match.matchType}</span>
                  <div className="match-list-info">
                    <div className="mli-time">{match.time}</div>
                    <div className="mli-loc">📍 {match.location}</div>
                  </div>
                  <span className="match-done-mark">{match.isCompleted ? '✅' : '🔜'}</span>
                </div>
              ))
            ) : (
              <p className="no-match-day">이 날에는 경기가 없어요</p>
            )}
          </div>
        </SwiperSlide>

      </Swiper>

      {/* ── 통장 잔액 카드 (Swiper 아래) ── */}
      <BalanceCard settings={settings} loading={loading} />
    </div>
  )
}

export default MainDashboard
