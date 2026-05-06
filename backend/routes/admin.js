import express from 'express';
import { createEvent, updateEvent, getAdminEvents, deleteEvent, getEventRegistrations, toggleShortlist, bulkShortlist, updateRegistrationRound, bulkUpdateRound, getAdminAnalytics, toggleDisqualify, revertRound, getEvaluators, createEvaluator, deleteEvaluator, deleteRegistration, getUsers, createUser, getAuditLogs, deleteUser, bulkSelectWinners, toggleWinner } from '../controllers/adminController.js';
import { protect, adminProtect, coordinatorProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth and admin middleware to all admin routes
// Applied individually below to allow different roles for different actions
// router.use(protect, adminProtect); 

router.get('/analytics', protect, adminProtect, getAdminAnalytics);
router.post('/events', protect, adminProtect, createEvent);
router.put('/events/:id', protect, adminProtect, updateEvent);
router.get('/events', protect, coordinatorProtect, getAdminEvents);
router.delete('/events/:id', protect, adminProtect, deleteEvent);

// Participants & Shortlisting & Rounds (Coordinator accessible)
router.get('/events/:id/registrations', protect, coordinatorProtect, getEventRegistrations);
router.patch('/registrations/:regId/shortlist', protect, coordinatorProtect, toggleShortlist);
router.post('/registrations/bulk-shortlist', protect, coordinatorProtect, bulkShortlist);
router.patch('/registrations/:regId/round', protect, coordinatorProtect, updateRegistrationRound);
router.post('/registrations/bulk-round', protect, coordinatorProtect, bulkUpdateRound);
router.patch('/registrations/:regId/disqualify', protect, coordinatorProtect, toggleDisqualify);
router.patch('/registrations/:regId/revert-round', protect, coordinatorProtect, revertRound);
router.patch('/registrations/:regId/winner', protect, coordinatorProtect, toggleWinner);
router.post('/registrations/bulk-winners', protect, coordinatorProtect, bulkSelectWinners);
router.delete('/registrations/:regId', protect, coordinatorProtect, deleteRegistration);

// Evaluators (Coordinator accessible)
router.get('/evaluators', protect, coordinatorProtect, getEvaluators);
router.post('/evaluators', protect, coordinatorProtect, createEvaluator);
router.delete('/evaluators/:id', protect, coordinatorProtect, deleteEvaluator);

// Users and Audit Logs (Admin only)
router.get('/users', protect, adminProtect, getUsers);
router.post('/users', protect, adminProtect, createUser);
router.delete('/users/:id', protect, adminProtect, deleteUser);
router.get('/audit-logs', protect, adminProtect, getAuditLogs);

export default router;
