import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { requireAuth } from '../middleware/auth.js';
import User from '../models/User.js';
import ApiKey from '../models/ApiKey.js';
import { addMonths, startOfMonth } from 'date-fns';

const router = Router();

// ─── GET PROFILE ───────────────────────────────────────────────────────────
router.get('/profile', requireAuth, (req, res) => {
  console.log('[SettingsRoute] Get profile for userId:', req.user._id.toString());
  const u = req.user;
  res.json({
    id: u._id, name: u.name, email: u.email, plan: u.plan,
    company: u.company, avatarUrl: u.avatarUrl, createdAt: u.createdAt,
  });
});

// ─── UPDATE PROFILE ────────────────────────────────────────────────────────
router.patch('/profile', requireAuth, async (req, res, next) => {
  try {
    console.log('[SettingsRoute] Update profile for userId:', req.user._id.toString(), 'payload keys:', Object.keys(req.body || {}));
    const allowed = ['name', 'email', 'company'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({
      id: user._id, name: user.name, email: user.email, plan: user.plan,
      company: user.company, avatarUrl: user.avatarUrl, createdAt: user.createdAt,
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET API KEY ───────────────────────────────────────────────────────────
router.get('/api-key', requireAuth, async (req, res, next) => {
  try {
    console.log('[SettingsRoute] Get API key for userId:', req.user._id.toString());
    const key = await ApiKey.findOne({ userId: req.user._id, isActive: true });
    if (!key) return res.json({ keyPrefix: null, createdAt: null, lastUsedAt: null, totalRequests: 0 });

    res.json({
      keyPrefix: key.keyPrefix,
      createdAt: key.createdAt,
      lastUsedAt: key.lastUsedAt,
      totalRequests: key.totalRequests,
    });
  } catch (err) {
    next(err);
  }
});

// ─── REGENERATE API KEY ────────────────────────────────────────────────────
router.post('/api-key/regenerate', requireAuth, async (req, res, next) => {
  try {
    console.log('[SettingsRoute] Regenerate API key for userId:', req.user._id.toString());
    // Deactivate all existing keys
    await ApiKey.updateMany({ userId: req.user._id }, { isActive: false });

    // Generate new key
    const rawKey = ApiKey.generateKey();
    const keyHash = await bcrypt.hash(rawKey, 10);
    await ApiKey.create({
      userId: req.user._id,
      keyHash,
      keyPrefix: rawKey.substring(0, 14) + '...',
      label: 'Regenerated Key',
    });

    // Return raw key ONCE — client must save it
    res.json({ rawKey, keyPrefix: rawKey.substring(0, 14) + '...' });
  } catch (err) {
    next(err);
  }
});

// ─── REVOKE API KEY ────────────────────────────────────────────────────────
router.delete('/api-key', requireAuth, async (req, res, next) => {
  try {
    console.log('[SettingsRoute] Revoke API key(s) for userId:', req.user._id.toString());
    await ApiKey.updateMany({ userId: req.user._id }, { isActive: false });
    res.json({ message: 'API key revoked' });
  } catch (err) {
    next(err);
  }
});

// ─── GET USAGE ─────────────────────────────────────────────────────────────
router.get('/usage', requireAuth, (req, res) => {
  console.log('[SettingsRoute] Get usage for userId:', req.user._id.toString());
  const u = req.user;
  const limit = u.plan === 'free' ? 3 : u.plan === 'pro' ? 100 : Infinity;
  const percentUsed = limit === Infinity ? 0 : Math.round((u.jobsUsedThisMonth / limit) * 100);
  const renewsAt = startOfMonth(addMonths(new Date(), 1)).toISOString();

  res.json({
    plan: u.plan,
    jobsUsedThisMonth: u.jobsUsedThisMonth,
    monthlyJobLimit: limit,
    percentUsed,
    renewsAt,
  });
});

export default router;
