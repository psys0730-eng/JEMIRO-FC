// ============================================================
// components/BalanceCard.jsx - 통장 잔액 카드 컴포넌트
// ============================================================

import './BalanceCard.css'

/**
 * 금액을 한국 원화 형식으로 변환 (예: 1234567 → "1,234,567")
 */
const formatKRW = (amount) =>
  Number(amount || 0).toLocaleString('ko-KR')

/**
 * updatedAt 날짜를 "MM/DD HH:mm" 형식으로 변환
 */
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${mm}/${dd} ${hh}:${min} 업데이트`
}

/**
 * BalanceCard 컴포넌트
 * @param {Object} settings - { balance, balanceMemo, updatedAt }
 * @param {boolean} loading - 로딩 상태
 */
function BalanceCard({ settings, loading }) {
  return (
    <div className="balance-card">

      {/* 상단: 라벨 + 로고 */}
      <div className="balance-top">
        <div className="balance-label">
          <span className="label-dot" />
          현재 통장 잔액
        </div>
        <span className="balance-logo">🏦</span>
      </div>

      {/* 금액 */}
      <div className="balance-amount-wrap">
        <div className="balance-currency">원 (KRW)</div>
        <div className="balance-amount">
          {loading ? '---' : formatKRW(settings?.balance)}
        </div>
      </div>

      {/* 하단: 메모 + 업데이트 일시 */}
      <div className="balance-bottom">
        <span className="balance-memo">
          {settings?.balanceMemo || '메모 없음'}
        </span>
        <span className="balance-updated-at">
          {formatDate(settings?.updatedAt)}
        </span>
      </div>
    </div>
  )
}

export default BalanceCard
