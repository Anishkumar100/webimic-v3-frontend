import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import User from '../models/User.js';
import ApiKey from '../models/ApiKey.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = Router();

const signToken = (user) =>
  jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// ─── REGISTER ──────────────────────────────────────────────────────────────
const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

router.post('/register', authLimiter, validate(registerSchema), async (req, res, next) => {
  try {
    const { name, email, password } = req.validated;
    console.log('[AuthRoute] Register attempt:', email);

    const existing = await User.findOne({ email });
    if (existing) {
      console.log('[AuthRoute] Register conflict:', email);
      return res.status(409).json({ error: 'Email already registered' });
    }

    const user = await User.create({ name, email, password });

    // Auto-generate the user's first API key
    const rawKey = ApiKey.generateKey();
    const keyHash = await bcrypt.hash(rawKey, 10);
    await ApiKey.create({
      userId: user._id,
      keyHash,
      keyPrefix: rawKey.substring(0, 14) + '...',
      label: 'Default Key',
    });

    const token = signToken(user);
    console.log('[AuthRoute] Register success for userId:', user._id.toString());
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, plan: user.plan },
    });
  } catch (err) {
    next(err);
  }
});

// ─── LOGIN ─────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/login', authLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.validated;
    console.log('[AuthRoute] Login attempt:', email);
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('[AuthRoute] Login failed (no user):', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      console.log('[AuthRoute] Login failed (bad password):', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken(user);
    console.log('[AuthRoute] Login success for userId:', user._id.toString());
    res.json({
      token,
      user: {
        id: user._id, name: user.name, email: user.email, plan: user.plan,
        jobsUsedThisMonth: user.jobsUsedThisMonth, monthlyJobLimit: user.monthlyJobLimit,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET CURRENT USER ──────────────────────────────────────────────────────
router.get('/me', requireAuth, (req, res) => {
  console.log('[AuthRoute] /me requested by userId:', req.user._id.toString());
  res.json({
    user: {
      id: req.user._id, name: req.user.name, email: req.user.email,
      plan: req.user.plan, jobsUsedThisMonth: req.user.jobsUsedThisMonth,
      monthlyJobLimit: req.user.monthlyJobLimit, createdAt: req.user.createdAt,
    },
  });
});

export default router;
