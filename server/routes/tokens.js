import { Router } from 'express';
import DesignToken from '../models/DesignToken.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// ─── GET AGGREGATED TOKENS ─────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res, next) => {
  try {
    console.log('[TokensRoute] Aggregate tokens for userId:', req.user._id.toString());
    const tokenDocs = await DesignToken.find({ userId: req.user._id });

    if (!tokenDocs.length) {
      return res.json({
        colors: [], typography: [], spacing: [], animations: [],
        jobCount: 0, lastUpdated: null,
      });
    }

    // Aggregate colors — merge by hex proximity, keep most frequent
    const colorMap = new Map();
    for (const doc of tokenDocs) {
      for (const c of doc.colors) {
        const existing = colorMap.get(c.hex);
        if (!existing || c.frequency > existing.frequency) {
          colorMap.set(c.hex, c);
        }
      }
    }
    const colors = Array.from(colorMap.values())
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 30);

    // Aggregate typography — deduplicate by fontFamily + tag combo
    const typoMap = new Map();
    for (const doc of tokenDocs) {
      for (const t of doc.typography) {
        const key = `${t.fontFamilyClean}:${t.tag}`;
        if (!typoMap.has(key)) typoMap.set(key, t);
      }
    }
    const typography = Array.from(typoMap.values()).slice(0, 20);

    // Aggregate spacing — deduplicate, sort ascending
    const spacingMap = new Map();
    for (const doc of tokenDocs) {
      for (const s of doc.spacing) {
        if (!spacingMap.has(s.numericValue)) spacingMap.set(s.numericValue, s);
      }
    }
    const spacing = Array.from(spacingMap.values())
      .sort((a, b) => a.numericValue - b.numericValue);

    // Aggregate animations — deduplicate
    const animMap = new Map();
    for (const doc of tokenDocs) {
      for (const a of doc.animations) {
        const key = `${a.type}:${a.trigger}:${a.duration}`;
        if (!animMap.has(key)) animMap.set(key, a);
      }
    }
    const animations = Array.from(animMap.values());

    // Find most recent update
    const lastUpdated = tokenDocs.reduce((latest, doc) => {
      return doc.updatedAt > latest ? doc.updatedAt : latest;
    }, tokenDocs[0].updatedAt);

    res.json({
      colors, typography, spacing, animations,
      jobCount: tokenDocs.length,
      lastUpdated: lastUpdated.toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
