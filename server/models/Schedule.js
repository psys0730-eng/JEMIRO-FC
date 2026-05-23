// ============================================================
// models/Schedule.js - 경기 일정 스키마
// ============================================================

const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema(
  {
    // 경기 날짜 (예: 2025-06-07)
    date: {
      type: Date,
      required: [true, '경기 날짜는 필수입니다.'],
    },

    // 경기 시간 (예: "19:00")
    time: {
      type: String,
      required: [true, '경기 시간은 필수입니다.'],
      trim: true,
    },

    // 장소 (예: "상암 풋살장 A구장")
    location: {
      type: String,
      required: [true, '장소는 필수입니다.'],
      trim: true,
    },

    // 경기 종류 (정기전 | 친선전 | 훈련 | 기타)
    matchType: {
      type: String,
      enum: ['정기전', '친선전', '훈련', '기타'],
      default: '정기전',
    },

    // 완료 여부 (경기가 끝났으면 true)
    isCompleted: {
      type: Boolean,
      default: false,
    },

    // 메모 (선택)
    memo: {
      type: String,
      trim: true,
      default: '',
    },

    // 참가 투표 목록 (유저 1명당 1표, 재투표 시 덮어씀)
    votes: [
      {
        user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        name:   { type: String, required: true },   // 표시용 이름 (비정규화)
        status: { type: String, enum: ['attend', 'absent'], required: true },
      },
    ],
  },
  {
    timestamps: true, // createdAt, updatedAt 자동 추가
  }
);

module.exports = mongoose.model('Schedule', ScheduleSchema);
