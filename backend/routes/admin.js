import express from 'express';
import { createEvent, updateEvent, getAdminEvents, deleteEvent, getEventRegistrations, toggleShortlist, bulkShortlist, updateRegistrationRound, bulkUpdateRound, getAdminAnalytics, toggleDisqualify, revertRound, getEvaluators, createEvaluator, deleteEvaluator, deleteRegistration } from '../controllers/adminController.js';
import { protect, adminProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth and admin middleware to all admin routes
router.use(protect, adminProtect);

router.get('/analytics', getAdminAnalytics);
router.post('/events', createEvent);
router.put('/events/:id', updateEvent);
router.get('/events', getAdminEvents);
router.delete('/events/:id', deleteEvent);

// Participants & Shortlisting & Rounds
router.get('/events/:id/registrations', getEventRegistrations);
router.patch('/registrations/:regId/shortlist', toggleShortlist);
router.post('/registrations/bulk-shortlist', bulkShortlist);
router.patch('/registrations/:regId/round', updateRegistrationRound);
router.post('/registrations/bulk-round', bulkUpdateRound);
router.patch('/registrations/:regId/disqualify', toggleDisqualify);
router.patch('/registrations/:regId/revert-round', revertRound);
router.delete('/registrations/:regId', deleteRegistration);

// Evaluators
router.get('/evaluators', getEvaluators);
router.post('/evaluators', createEvaluator);
router.delete('/evaluators/:id', deleteEvaluator);

export default router;
