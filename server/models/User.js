// ============================================================
// models/User.js - 사용자(총무/관리자) 데이터 스키마 정의
// ============================================================

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema(
  {
    // 사용자 이름 (예: "김총무")
    name: {
      type: String,
      required: [true, '이름은 필수 항목입니다.'],
      trim: true,
    },

    // 로그인에 사용할 이메일 (고유값)
    email: {
      type: String,
      required: [true, '이메일은 필수 항목입니다.'],
      unique: true,
      lowercase: true,
      trim: true,
    },

    // bcrypt로 해시화된 비밀번호 (절대 평문 저장 금지!)
    password: {
      type: String,
      required: [true, '비밀번호는 필수 항목입니다.'],
      minlength: 6,
    },

    // 관리자(총무) 여부 구분
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member',
    },
  },
  {
    // createdAt, updatedAt 필드를 자동으로 추가
    timestamps: true,
  }
);

// ── 비밀번호 해시화 미들웨어 ───────────────────────────────
// save() 호출 전에 자동으로 실행되는 pre-hook
UserSchema.pre('save', async function () {
  // 비밀번호가 변경되지 않았으면 스킵
  if (!this.isModified('password')) return;

  // saltRounds: 10
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ── 비밀번호 비교 메서드 ───────────────────────────────────
// 로그인 시 입력한 평문 비밀번호와 DB의 해시값을 비교합니다.
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
