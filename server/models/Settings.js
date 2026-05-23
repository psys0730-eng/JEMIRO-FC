// ============================================================
// models/Settings.js - 앱 전역 설정 스키마
// 남은 경기 횟수 등 관리에 사용
// ============================================================

const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema(
  {
    // 설정 구분 키 (싱글턴처럼 'global' 하나만 사용)
    key: {
      type: String,
      default: 'global',
      unique: true,
    },

    // 남은 경기 횟수 (경기 완료 시 1씩 차감)
    remainingMatches: {
      type: Number,
      default: 0,
    },

    // 이번 시즌 총 경기 횟수
    totalMatches: {
      type: Number,
      default: 0,
    },

    // 현재 통장 잔액 (원 단위)
    balance: {
      type: Number,
      default: 0,
    },

    // 잔액 메모 (예: "5월 회비 정산 완료")
    balanceMemo: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', SettingsSchema);
