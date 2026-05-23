// ============================================================
// pages/AdminPage.jsx - 관리자 전용 페이지
// ============================================================

import { useState, useEffect } from 'react'
import { getSettingsAPI, updateBalanceAPI } from '../api/settings'
import {
  getSchedulesAPI,
  createScheduleAPI,
  updateScheduleAPI,
  deleteScheduleAPI,
  completeScheduleAPI,
} from '../api/schedules'
import './AdminPage.css'

// 날짜를 input[type=date] 값 형식으로 변환 (yyyy-mm-dd)
const toInputDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const yyyy = d.getFullYear()
  const mm   = String(d.getMonth() + 1).padStart(2, '0')
  const dd   = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const EMPTY_FORM = { date: '', time: '', location: '', matchType: '정기전', memo: '' }

function AdminPage({ user, onGoBack }) {

  // ── 잔액 상태 ────────────────────────────────────────────
  const [settings,      setSettings]      = useState(null)
  const [balanceInput,  setBalanceInput]  = useState('')
  const [memoInput,     setMemoInput]     = useState('')
  const [saving,        setSaving]        = useState(false)
  const [saveMsg,       setSaveMsg]       = useState('')

  // ── 경기 일정 상태 ───────────────────────────────────────
  const [schedules,     setSchedules]     = useState([])
  const [form,          setForm]          = useState(EMPTY_FORM)  // 등록/수정 폼
  const [editingId,     setEditingId]     = useState(null)        // null=등록모드, id=수정모드
  const [schedLoading,  setSchedLoading]  = useState(false)
  const [schedMsg,      setSchedMsg]      = useState('')
  const [completing,    setCompleting]    = useState(null)

  // ── 데이터 로딩 ──────────────────────────────────────────
  useEffect(() => {
    getSettingsAPI().then(data => {
      setSettings(data)
      setBalanceInput(String(data.balance ?? 0))
      setMemoInput(data.balanceMemo ?? '')
    }).catch(console.error)

    loadSchedules()
  }, [])

  const loadSchedules = () => {
    getSchedulesAPI().then(setSchedules).catch(console.error)
  }

  // 다가오는 경기 (완료 안됐고 오늘 이후인 것 중 가장 빠른 것)
  const now = new Date()
  const upcoming = schedules
    .filter(s => !s.isCompleted && new Date(s.date) >= now)
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  // ── 잔액 저장 ────────────────────────────────────────────
  const formatKRW = (n) => Number(n || 0).toLocaleString('ko-KR')

  const handleSaveBalance = async () => {
    const num = Number(balanceInput.replace(/,/g, ''))
    if (isNaN(num) || num < 0) { setSaveMsg('❌ 올바른 금액을 입력해 주세요.'); return }
    setSaving(true); setSaveMsg('')
    try {
      const result = await updateBalanceAPI(num, memoInput)
      setSettings(result.settings)
      setSaveMsg('✅ 잔액이 저장되었습니다!')
      setTimeout(() => setSaveMsg(''), 3000)
    } catch (err) {
      setSaveMsg('❌ ' + (err.response?.data?.message || '저장 중 오류'))
    } finally { setSaving(false) }
  }

  // ── 폼 핸들러 ────────────────────────────────────────────
  const handleFormChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  // 수정 버튼 클릭 → 폼에 기존 값 채우기
  const handleEdit = (schedule) => {
    setEditingId(schedule._id)
    setForm({
      date:      toInputDate(schedule.date),
      time:      schedule.time,
      location:  schedule.location,
      matchType: schedule.matchType,
      memo:      schedule.memo || '',
    })
    setSchedMsg('')
    // 폼으로 스크롤
    document.getElementById('sched-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  // 등록/수정 저장
  const handleSchedSave = async () => {
    if (!form.date || !form.time || !form.location) {
      setSchedMsg('❌ 날짜, 시간, 장소는 필수입니다.')
      return
    }
    setSchedLoading(true); setSchedMsg('')
    try {
      if (editingId) {
        await updateScheduleAPI(editingId, form)
        setSchedMsg('✅ 일정이 수정되었습니다!')
      } else {
        await createScheduleAPI(form)
        setSchedMsg('✅ 일정이 등록되었습니다!')
      }
      setForm(EMPTY_FORM)
      setEditingId(null)
      loadSchedules()
      setTimeout(() => setSchedMsg(''), 3000)
    } catch (err) {
      setSchedMsg('❌ ' + (err.response?.data?.message || '저장 중 오류'))
    } finally { setSchedLoading(false) }
  }

  // 삭제
  const handleDelete = async (id) => {
    if (!window.confirm('이 일정을 삭제하시겠습니까?')) return
    try {
      await deleteScheduleAPI(id)
      setSchedules(prev => prev.filter(s => s._id !== id))
      if (editingId === id) { setForm(EMPTY_FORM); setEditingId(null) }
    } catch (err) {
      alert(err.response?.data?.message || '삭제 중 오류가 발생했습니다.')
    }
  }

  // 완료 처리
  const handleComplete = async (id) => {
    if (!window.confirm('이 경기를 완료 처리하시겠습니까?')) return
    setCompleting(id)
    try {
      await completeScheduleAPI(id)
      setSchedules(prev => prev.map(s => s._id === id ? { ...s, isCompleted: true } : s))
    } catch (err) {
      alert(err.response?.data?.message || '오류가 발생했습니다.')
    } finally { setCompleting(null) }
  }

  // 취소 (폼 초기화)
  const handleCancel = () => { setForm(EMPTY_FORM); setEditingId(null); setSchedMsg('') }

  // 날짜 포맷
  const fmtDate = (d) => {
    const date = new Date(d)
    return `${date.getMonth() + 1}/${date.getDate()} ${['일','월','화','수','목','금','토'][date.getDay()]}요일`
  }

  // ── 렌더링 ──────────────────────────────────────────────
  return (
    <div className="admin-page">

      {/* ── 헤더 ── */}
      <header className="admin-header">
        <button className="admin-back-btn" onClick={onGoBack}>←</button>
        <div className="admin-header-title">
          <h2>⚙️ 관리자 페이지</h2>
          <p>{user?.name}님 · 관리자 전용</p>
        </div>
      </header>

      <main className="admin-main">

        {/* ════════════ 경기 일정 관리 (최상단) ════════════ */}
        <p className="admin-section-title">📅 경기 일정 관리</p>

        {/* 다가오는 경기 목록 */}
        {upcoming.length === 0 ? (
          <div className="sched-empty">등록된 예정 경기가 없어요</div>
        ) : (
          <div className="sched-list">
            {upcoming.map(s => (
              <div key={s._id} className={`sched-item ${editingId === s._id ? 'editing' : ''}`}>
                <div className="sched-item-info">
                  <span className="sched-type-pill">{s.matchType}</span>
                  <div className="sched-date">{fmtDate(s.date)}</div>
                  <div className="sched-detail">{s.time} · {s.location}</div>
                  {s.memo && <div className="sched-memo">📝 {s.memo}</div>}
                  <div className="sched-vote-count">
                    ✅ {s.votes?.filter(v=>v.status==='attend').length ?? 0}명 참가 &nbsp;
                    ❌ {s.votes?.filter(v=>v.status==='absent').length ?? 0}명 불참
                  </div>
                </div>
                <div className="sched-item-actions">
                  <button className="sched-edit-btn"   onClick={() => handleEdit(s)}>수정</button>
                  <button
                    className="sched-complete-btn"
                    onClick={() => handleComplete(s._id)}
                    disabled={completing === s._id}
                  >
                    {completing === s._id ? '...' : '완료'}
                  </button>
                  <button className="sched-delete-btn" onClick={() => handleDelete(s._id)}>삭제</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 등록/수정 폼 */}
        <div id="sched-form" className="sched-form-card">
          <p className="sched-form-title">
            {editingId ? '✏️ 일정 수정' : '➕ 새 경기 등록'}
          </p>

          <div className="sched-form-grid">
            <div className="sched-field">
              <label>날짜</label>
              <input type="date" name="date" value={form.date} onChange={handleFormChange} />
            </div>
            <div className="sched-field">
              <label>시간</label>
              <input type="time" name="time" value={form.time} onChange={handleFormChange} />
            </div>
            <div className="sched-field full">
              <label>장소</label>
              <input type="text" name="location" placeholder="예: 상암 풋살장 A구장" value={form.location} onChange={handleFormChange} />
            </div>
            <div className="sched-field">
              <label>경기 종류</label>
              <select name="matchType" value={form.matchType} onChange={handleFormChange}>
                <option value="정기전">정기전</option>
                <option value="친선전">친선전</option>
                <option value="토너먼트">토너먼트</option>
                <option value="기타">기타</option>
              </select>
            </div>
            <div className="sched-field full">
              <label>메모 (선택)</label>
              <input type="text" name="memo" placeholder="예: 유니폼 꼭 챙겨오세요!" value={form.memo} onChange={handleFormChange} maxLength={60} />
            </div>
          </div>

          {schedMsg && (
            <div className={`balance-save-msg ${schedMsg.startsWith('✅') ? 'success' : 'error'}`}>
              {schedMsg}
            </div>
          )}

          <div className="sched-form-btns">
            {editingId && (
              <button className="sched-cancel-btn" onClick={handleCancel}>취소</button>
            )}
            <button
              className="balance-save-btn"
              onClick={handleSchedSave}
              disabled={schedLoading}
            >
              {schedLoading ? '저장 중...' : editingId ? '💾 수정 저장' : '➕ 경기 등록'}
            </button>
          </div>
        </div>

        {/* ════════════ 통장 잔액 수정 ════════════ */}
        <p className="admin-section-title">💳 통장 잔액 관리</p>
        <div className="balance-edit-card">
          <div className="balance-edit-current">
            <span className="balance-edit-label">현재 잔액</span>
            <span className="balance-edit-value">
              {settings ? `${formatKRW(settings.balance)}원` : '로딩 중...'}
            </span>
          </div>
          <div className="balance-edit-field">
            <label htmlFor="balanceInput">새 잔액 (원)</label>
            <div className="balance-input-wrap">
              <input id="balanceInput" type="number" min="0" placeholder="예: 350000"
                value={balanceInput} onChange={(e) => setBalanceInput(e.target.value)} />
              <span className="balance-unit">원</span>
            </div>
          </div>
          <div className="balance-edit-field">
            <label htmlFor="memoInput">메모 (선택)</label>
            <input id="memoInput" type="text" placeholder="예: 5월 회비 정산 완료"
              value={memoInput} onChange={(e) => setMemoInput(e.target.value)} maxLength={40} />
          </div>
          {saveMsg && (
            <div className={`balance-save-msg ${saveMsg.startsWith('✅') ? 'success' : 'error'}`}>
              {saveMsg}
            </div>
          )}
          <button className="balance-save-btn" onClick={handleSaveBalance} disabled={saving}>
            {saving ? '저장 중...' : '💾 잔액 저장'}
          </button>
        </div>

      </main>
    </div>
  )
}

export default AdminPage
