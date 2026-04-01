import express from 'express';
import passport from 'passport';
import { loginSuccess, loginFailed, logout, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Auth with Google (Initiates the OAuth flow)
// @route   GET /api/auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @desc    Google auth callback
// @route   GET /api/auth/google/callback
router.get('/google/callback', 
  passport.authenticate('google', {
    failureRedirect: '/api/auth/login/failed',
  }),
  (req, res) => {
    // Explicitly save session before redirecting to prevent race conditions on strict browsers (Safari/iPhone)
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=session_loss`);
      }
      res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    });
  }
);

// @desc    Check successful login and return user details
// @route   GET /api/auth/login/success
router.get('/login/success', loginSuccess);

// @desc    Failed login response
// @route   GET /api/auth/login/failed
router.get('/login/failed', loginFailed);

// @desc    Logout user
// @route   GET /api/auth/logout
router.get('/logout', logout);

// @desc    Update user profile data
// @route   PUT /api/auth/profile
router.put('/profile', protect, updateProfile);

export default router;
