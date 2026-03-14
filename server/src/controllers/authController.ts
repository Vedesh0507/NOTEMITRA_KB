import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { User, RefreshToken } from '../models';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} from '../utils/jwt';

/**
 * Register new user
 * POST /api/auth/signup
 */
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { name, email, password, section, branch, designation, department, facultyId } = req.body;

    // Server-side email domain validation and role assignment
    const emailLower = email.toLowerCase();
    let role: 'student' | 'admin';

    if (emailLower.endsWith('@mictech.edu.in')) {
      role = 'student';
    } else if (emailLower.endsWith('@mictech.ac.in')) {
      role = 'admin';
    } else {
      res.status(400).json({ error: 'Only MIC College official emails are allowed' });
      return;
    }

    // Validate required faculty fields when faculty email is used
    if (role === 'admin') {
      if (!facultyId || !/^[0-9]{4}$/.test(facultyId)) {
        res.status(400).json({ error: 'Faculty ID must be exactly 4 digits' });
        return;
      }
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    // Build user data
    const userData: Record<string, any> = {
      name,
      email: emailLower,
      passwordHash: password,
      role,
      section,
      branch
    };

    // Add faculty-specific fields
    if (role === 'admin') {
      userData.designation = designation;
      userData.department = department;
      userData.facultyId = facultyId;
    }

    // Create user
    const user = await User.create(userData);

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token
    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        section: user.section,
        branch: user.branch,
        profilePic: user.profilePic,
        designation: user.designation,
        department: user.department,
        facultyId: user.facultyId
      },
      accessToken,
      refreshToken
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token
    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        section: user.section,
        branch: user.branch,
        profilePic: user.profilePic,
        reputation: user.reputation
      },
      accessToken,
      refreshToken
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export const refreshAccessToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token required' });
      return;
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    // Check if token exists in database
    const storedToken = await RefreshToken.findOne({
      token: refreshToken,
      userId: payload.userId
    });

    if (!storedToken) {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }

    // Check if token expired
    if (storedToken.expiresAt < new Date()) {
      await RefreshToken.deleteOne({ _id: storedToken._id });
      res.status(401).json({ error: 'Refresh token expired' });
      return;
    }

    // Get user
    const user = await User.findById(payload.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Generate new access token
    const accessToken = generateAccessToken(user);

    res.json({ accessToken });
  } catch (error: any) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Delete refresh token
      await RefreshToken.deleteOne({ token: refreshToken });
    }

    res.json({ message: 'Logout successful' });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};

/**
 * Get current user
 * GET /api/auth/me
 */
export const getCurrentUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        section: req.user.section,
        branch: req.user.branch,
        profilePic: req.user.profilePic,
        reputation: req.user.reputation,
        uploadsCount: req.user.uploadsCount,
        isVerified: req.user.isVerified,
        designation: req.user.designation,
        department: req.user.department,
        facultyId: req.user.facultyId
      }
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

/**
 * Google OAuth callback
 * GET /api/auth/google/callback
 */
export const googleCallback = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
      return;
    }

    const user = req.user as any;

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token
    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    // Redirect to frontend with tokens
    res.redirect(
      `${process.env.FRONTEND_URL}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`
    );
  } catch (error: any) {
    console.error('Google callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  }
};

/**
 * Verify email and issue reset token
 * POST /api/auth/verify-email-for-reset
 */
export const verifyEmailForReset = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const emailLower = email.toLowerCase().trim();

    // Validate domain
    if (!emailLower.endsWith('@mictech.edu.in') && !emailLower.endsWith('@mictech.ac.in')) {
      res.status(400).json({ error: 'Only MIC College official emails are allowed' });
      return;
    }

    const user = await User.findOne({ email: emailLower });
    if (!user) {
      res.status(404).json({ error: 'No account found with this email' });
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    res.json({ success: true, token: resetToken });
  } catch (error: any) {
    console.error('Verify email for reset error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

/**
 * Verify reset token validity
 * POST /api/auth/verify-reset-token
 */
export const verifyResetToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      res.json({ valid: false });
      return;
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() }
    });

    res.json({ valid: !!user });
  } catch (error: any) {
    console.error('Verify reset token error:', error);
    res.json({ valid: false });
  }
};

/**
 * Reset password using token
 * POST /api/auth/reset-password
 */
export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password) {
      res.status(400).json({ error: 'Token and password are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      res.status(400).json({ error: 'Passwords do not match' });
      return;
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() }
    });

    if (!user) {
      res.status(400).json({ error: 'Invalid or expired reset token' });
      return;
    }

    // Hash the new password directly (bypass pre-save hook to avoid double hashing)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.passwordHash = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    // Use updateOne to skip the pre-save hook (which would double-hash)
    await User.updateOne(
      { _id: user._id },
      {
        $set: { passwordHash: hashedPassword },
        $unset: { resetToken: 1, resetTokenExpiry: 1 }
      }
    );

    res.json({ message: 'Password reset successful' });
  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};
