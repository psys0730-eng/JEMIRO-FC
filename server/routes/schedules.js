// ============================================================
// routes/schedules.js - 경기 일정 라우터
// ============================================================

const express = require('express');
const router = express.Router();
const {
  getSchedules,
  createSchedule,
  completeSchedule,
  updateSchedule,
  deleteSchedule,
  voteSchedule,
} = require('../controllers/scheduleController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/',              protect,             getSchedules);
router.post('/',             protect, adminOnly,  createSchedule);
router.patch('/:id/complete',protect, adminOnly,  completeSchedule);
router.patch('/:id/vote',   protect,             voteSchedule);
router.patch('/:id',        protect, adminOnly,  updateSchedule);
router.delete('/:id',       protect, adminOnly,  deleteSchedule);

module.exports = router;
