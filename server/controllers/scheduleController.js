// ============================================================
// controllers/scheduleController.js - 경기 일정 API 로직
// ============================================================

const Schedule = require('../models/Schedule');
const Settings = require('../models/Settings');

// ── GET /api/schedules ──────────────────────────────────────
// 전체 일정 가져오기 (달력 표시용)
// 날짜 오름차순 정렬 → 가장 빠른 경기부터
exports.getSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .sort({ date: 1 }); // 날짜 오름차순

    res.status(200).json({ schedules });
  } catch (err) {
    console.error('일정 조회 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// ── POST /api/schedules ─────────────────────────────────────
// 새 일정 등록 (관리자만 가능)
exports.createSchedule = async (req, res) => {
  try {
    const { date, time, location, matchType, memo } = req.body;

    if (!date || !time || !location) {
      return res.status(400).json({ message: '날짜, 시간, 장소는 필수입니다.' });
    }

    const schedule = new Schedule({ date, time, location, matchType, memo });
    await schedule.save();

    res.status(201).json({ message: '일정이 등록되었습니다.', schedule });
  } catch (err) {
    console.error('일정 등록 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// ── PATCH /api/schedules/:id/complete ──────────────────────
// 경기 완료 처리 + Settings의 남은 경기 횟수 1 차감 (관리자만)
exports.completeSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. 해당 일정 조회
    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return res.status(404).json({ message: '해당 일정을 찾을 수 없습니다.' });
    }

    // 이미 완료된 경기인지 확인
    if (schedule.isCompleted) {
      return res.status(400).json({ message: '이미 완료 처리된 경기입니다.' });
    }

    // 2. 경기 완료 처리
    schedule.isCompleted = true;
    await schedule.save();

    // 3. Settings의 남은 경기 횟수 차감
    // findOneAndUpdate로 upsert(없으면 생성) 처리
    const settings = await Settings.findOneAndUpdate(
      { key: 'global' },
      { $inc: { remainingMatches: -1 } }, // 1 차감
      { new: true, upsert: true }         // 없으면 생성, 변경된 값 반환
    );

    res.status(200).json({
      message: '경기가 완료 처리되었습니다.',
      schedule,
      remainingMatches: Math.max(0, settings.remainingMatches), // 음수 방지
    });
  } catch (err) {
    console.error('경기 완료 처리 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};
// ── PATCH /api/schedules/:id ────────────────────────────────
// 일정 수정 (관리자만)
exports.updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time, location, matchType, memo } = req.body;

    const schedule = await Schedule.findByIdAndUpdate(
      id,
      { date, time, location, matchType, memo },
      { new: true, runValidators: true }
    );
    if (!schedule) return res.status(404).json({ message: '해당 일정을 찾을 수 없습니다.' });

    res.status(200).json({ message: '일정이 수정되었습니다.', schedule });
  } catch (err) {
    console.error('일정 수정 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// ── DELETE /api/schedules/:id ───────────────────────────────
// 일정 삭제 (관리자만)
exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await Schedule.findByIdAndDelete(id);
    if (!schedule) return res.status(404).json({ message: '해당 일정을 찾을 수 없습니다.' });

    res.status(200).json({ message: '일정이 삭제되었습니다.' });
  } catch (err) {
    console.error('일정 삭제 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// ── PATCH /api/schedules/:id/vote ──────────────────────────
// 참가/불참 투표 (로그인한 모든 사용자)
// 재투표 시 기존 투표를 덮어씀 (1인 1표)
exports.voteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'attend' | 'absent'

    if (!['attend', 'absent'].includes(status)) {
      return res.status(400).json({ message: "'attend' 또는 'absent' 값만 가능합니다." });
    }

    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return res.status(404).json({ message: '해당 일정을 찾을 수 없습니다.' });
    }
    if (schedule.isCompleted) {
      return res.status(400).json({ message: '완료된 경기는 투표할 수 없습니다.' });
    }

    const userId = req.user._id;

    // 기존 투표 제거 후 새 투표 추가 (1인 1표 유지)
    schedule.votes = schedule.votes.filter(
      (v) => !v.user.equals(userId)
    );
    schedule.votes.push({ user: userId, name: req.user.name, status });

    await schedule.save();

    // 참가/불참 인원 집계
    const attendCount = schedule.votes.filter((v) => v.status === 'attend').length;
    const absentCount = schedule.votes.filter((v) => v.status === 'absent').length;

    res.status(200).json({
      message: status === 'attend' ? '참가로 투표했습니다! 🙌' : '불참으로 투표했습니다.',
      votes: schedule.votes,
      attendCount,
      absentCount,
    });
  } catch (err) {
    console.error('투표 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};
