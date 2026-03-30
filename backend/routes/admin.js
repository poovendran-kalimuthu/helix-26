import express from 'express';
import { createEvent, updateEvent, getAdminEvents, deleteEvent, getEventRegistrations, toggleShortlist, bulkShortlist, updateRegistrationRound, bulkUpdateRound, getAdminAnalytics, toggleDisqualify, revertRound, getEvaluators, createEvaluator, deleteEvaluator, deleteRegistration } from '../controllers/adminController.js';
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
router.delete('/registrations/:regId', protect, coordinatorProtect, deleteRegistration);

// Evaluators (Coordinator accessible)
router.get('/evaluators', protect, coordinatorProtect, getEvaluators);
router.post('/evaluators', protect, coordinatorProtect, createEvaluator);
router.delete('/evaluators/:id', protect, coordinatorProtect, deleteEvaluator);

export default router;
