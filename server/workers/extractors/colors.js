import sharp from 'sharp';
// ml-kmeans is CJS: `module.exports = kmeans` — default import IS the function (not `{ kmeans }`).
import kmeans from 'ml-kmeans';
import chroma from 'chroma-js';
import { calculateContrastRatio, getWCAGRating } from '../../utils/contrast.js';
import { assignColorRole } from '../../utils/colorRole.js';

export const extractColors = async (pages) => {
  console.log('[ExtractColors] Start:', { pageCount: pages.length });

  // ── STEP 1: Collect pixel samples from all pages ──────────────────────────
  // Use a flat Float64Array-compatible approach: collect into a 2D array but
  // keep the image tiny (100×100 = 10 000 pixels vs old 300×300 = 90 000).
  const allPixelSamples = [];

  for (const page of pages) {
    if (!page.screenshotBuffer?.length) continue;
    console.log('[ExtractColors] Sampling screenshot buffer bytes:', page.screenshotBuffer.length);

    const { data } = await sharp(page.screenshotBuffer)
      .resize(100, 100, { fit: 'cover' }) // 10 000 pixels — plenty for color clustering
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Convert buffer to [R, G, B] rows
    for (let i = 0; i < data.length; i += 3) {
      allPixelSamples.push([data[i], data[i + 1], data[i + 2]]);
    }
  }

  // ── STEP 2: Subsample to 5 000 pixels ─────────────────────────────────────
  const TARGET_SAMPLE = 5000;
  const step = Math.max(1, Math.ceil(allPixelSamples.length / TARGET_SAMPLE));
  const subsample = [];
  for (let i = 0; i < allPixelSamples.length && subsample.length < TARGET_SAMPLE; i += step) {
    subsample.push(allPixelSamples[i]);
  }

  if (subsample.length < 20) {
    console.log('[ExtractColors] Not enough pixel samples, returning empty tokens');
    return []; // Not enough pixel data
  }
  console.log('[ExtractColors] Pixel sample stats:', {
    allPixels: allPixelSamples.length,
    subsample: subsample.length,
  });

  // ── STEP 3: K-Means clustering ───────────────────────────────────────────
  // Use 'random' initialization (O(k) memory) instead of 'mostDistant' (O(n·k) memory).
  // 10 clusters is sufficient for design-token extraction.
  const clusterCount = Math.min(10, subsample.length);
  const result = kmeans(subsample, clusterCount, {
    initialization: 'random',
    maxIterations: 20,
    tolerance: 1e-4,
  });

  // Count frequency of each cluster
  const clusterCounts = new Array(result.centroids.length).fill(0);
  result.clusters.forEach((c) => clusterCounts[c]++);
  const totalPoints = subsample.length;

  // ── STEP 4: Build color token objects ─────────────────────────────────────
  const colorTokens = result.centroids
    .map((centroid, i) => {
      const [r, g, b] = centroid.centroid.map(Math.round);
      // Skip centroids with NaN values (can happen with sparse data)
      if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
        console.warn('[ExtractColors] Skipping centroid with NaN values:', centroid.centroid);
        return null;
      }
      const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
      const frequency = clusterCounts[i] / totalPoints;

      // WCAG contrast against white and black
      const contrastOnWhite = calculateContrastRatio({ r, g, b }, { r: 255, g: 255, b: 255 });
      const contrastOnBlack = calculateContrastRatio({ r, g, b }, { r: 0, g: 0, b: 0 });

      return {
        hex,
        rgb: { r, g, b },
        frequency,
        source: 'pixel',
        luminance: chroma(hex).luminance(),
      };
    })
    .filter((c) => c !== null)
    .filter((c) => !(c.luminance > 0.95 && c.frequency < 0.005))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 12);

  // ── STEP 5: Extract CSS Colors ──────────────────────────────────────────
  const cssColorCounts = {};
  pages.forEach(p => {
    (p.rawStyles || []).forEach(s => {
      const add = (cStr) => {
        if (!cStr || cStr === 'rgba(0, 0, 0, 0)' || cStr === 'transparent' || cStr === 'none') return;
        try {
          const c = chroma(cStr);
          if (c.alpha() < 0.1) return;
          const hex = c.hex().toUpperCase();
          cssColorCounts[hex] = (cssColorCounts[hex] || 0) + 1;
        } catch {}
      };
      add(s.color);
      add(s.backgroundColor);
      if (s.border && s.border !== 'none') {
        const match = s.border.match(/(rgb|rgba)\([^)]+\)|#[0-9a-fA-F]{3,6}/);
        if (match) add(match[0]);
      }
    });
  });

  const totalCssSamples = Object.values(cssColorCounts).reduce((a, b) => a + b, 0) || 1;
  const topCssColors = Object.entries(cssColorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([hex, count]) => {
      const c = chroma(hex);
      const [r, g, b] = c.rgb();
      return {
        hex,
        rgb: { r, g, b },
        frequency: count / totalCssSamples,
        source: 'css',
        luminance: c.luminance(),
      };
    });

  // ── STEP 6: Merge & Assign Roles ────────────────────────────────────────
  const mergedTokens = [...topCssColors];
  colorTokens.forEach(pc => {
    // Add pixel color if it's visually distinct from all CSS colors
    const isDistinct = !mergedTokens.some(mc => chroma.distance(mc.hex, pc.hex, 'lab') < 10);
    if (isDistinct) {
      mergedTokens.push(pc);
    }
  });

  // Re-calculate WCAG and sort by frequency
  const finalTokens = mergedTokens
    .map(c => ({
      ...c,
      wcagContrast: {
        onWhite: getWCAGRating(calculateContrastRatio(c.rgb, { r: 255, g: 255, b: 255 })),
        onBlack: getWCAGRating(calculateContrastRatio(c.rgb, { r: 0, g: 0, b: 0 })),
      }
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 20);

  // Assign semantic roles
  const withRoles = assignColorRole(finalTokens);
  console.log('[ExtractColors] Complete:', { tokenCount: withRoles.length });

  return withRoles;
};
