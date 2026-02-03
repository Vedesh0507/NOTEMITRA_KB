import { Router } from 'express';
import passport from 'passport';
import {
  signup,
  login,
  refreshAccessToken,
  logout,
  getCurrentUser,
  googleCallback
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validateSignup, validateLogin } from '../middleware/validators';

const router = Router();

// Email/password auth
router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);
router.post('/refresh', refreshAccessToken);
router.post('/logout', logout);

// Get current user
router.get('/me', authenticate, getCurrentUser);

// Google OAuth
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  googleCallback
);

export default router;
