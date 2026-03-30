import express from 'express';
import { startAttendance, endAttendance, checkIn, manualMark, markByAdminScan, getAttendanceReport } from '../controllers/attendanceController.js';
import { protect, adminProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Student Check-in
router.post('/checkin', protect, checkIn);

// Admin Controls
router.use(protect, adminProtect);
router.post('/start', startAttendance);
router.post('/end', endAttendance);
router.post('/manual', manualMark);
router.post('/admin-scan', markByAdminScan);
router.get('/report/:eventId', getAttendanceReport);

export default router;
