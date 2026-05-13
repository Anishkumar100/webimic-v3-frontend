import { v2 as cloudinary } from 'cloudinary';

// Build a Tailwind v3 theme.extend snippet (string) from the tokens.
const buildTailwindConfig = ({ colors, typography, spacing }) => {
  const safe = (s) => String(s || '').replace(/'/g, "\\'");
  const colorEntries = colors.map((c, i) => {
    const key = c.role && c.role !== 'neutral' ? c.role : `palette-${i + 1}`;
    return `        '${key}': '${c.hex}',`;
  }).join('\n');
  const fontFamilies = Array.from(new Set(typography.map((t) => t.fontFamilyClean).filter(Boolean)));
  const fontEntries = fontFamilies.map((f, i) => {
    const key = i === 0 ? 'display' : i === 1 ? 'body' : `alt-${i - 1}`;
    return `        ${key}: ['${safe(f)}', 'sans-serif'],`;
  }).join('\n');
  const spacingEntries = spacing.map((s) => `        '${s.name}': '${s.value}',`).join('\n');
  return `module.exports = {
  theme: {
    extend: {
      colors: {
${colorEntries || '        // none'}
      },
      fontFamily: {
${fontEntries || '        // none'}
      },
      spacing: {
${spacingEntries || '        // none'}
      },
    },
  },
};`;
};

const buildCssVars = ({ colors, typography, spacing }) => {
  const lines = [];
  colors.forEach((c, i) => {
    const key = c.role && c.role !== 'neutral' ? c.role : `palette-${i + 1}`;
    lines.push(`  --color-${key}: ${c.hex};`);
  });
  Array.from(new Set(typography.map((t) => t.fontFamilyClean).filter(Boolean)))
    .forEach((f, i) => lines.push(`  --font-${i === 0 ? 'display' : i === 1 ? 'body' : `alt-${i - 1}`}: '${f}';`));
  spacing.forEach((s) => lines.push(`  --space-${s.name}: ${s.value};`));
  return `:root {\n${lines.join('\n') || '  /* no tokens */'}\n}`;
};

export const buildLLMContext = async ({ jobId, url, pages, tokens }) => {
  const startedAt = Date.now();
  console.log('[LLMContext] Start:', { jobId, source: url, pages: pages.length });

  const colors = (tokens.colors || []).map((c) => ({
    hex: c.hex,
    rgb: c.rgb,
    role: c.role || 'neutral',
    frequency: typeof c.frequency === 'number' ? +(c.frequency * 100).toFixed(2) : null,
    luminance: typeof c.luminance === 'number' ? +c.luminance.toFixed(3) : null,
    wcag: {
      onWhite: c.wcagContrast?.onWhite || 'N/A',
      onBlack: c.wcagContrast?.onBlack || 'N/A',
    },
  }));

  const typography = (tokens.typography || []).map((t) => ({
    role: t.tag,
    fontFamily: t.fontFamily,
    fontFamilyClean: t.fontFamilyClean,
    fontSize: t.fontSize,
    fontWeight: t.fontWeight,
    lineHeight: t.lineHeight,
    letterSpacing: t.letterSpacing,
    textTransform: t.textTransform,
    sampleText: t.sampleText,
    observedCount: t.count || 1,
  }));

  const spacing = (tokens.spacing || []).map((s) => ({
    token: s.name,
    px: s.value,
    rem: `${(s.numericValue / 16).toFixed(3)}rem`,
    category: s.category,
    usageCount: s.usageCount,
  }));

  const animations = (tokens.animations || []).map((a) => ({
    type: a.type,
    trigger: a.trigger,
    target: a.target,
    duration: a.duration,
    durationMs: a.durationMs,
    easing: a.easing,
    properties: a.properties,
  }));

  const context = {
    source: url,
    jobId,
    analyzedAt: new Date().toISOString(),
    pageCount: pages.length,
    pages: pages.map((p) => ({
      url: p.url,
      title: p.title,
      linkCount: p.linkCount,
      screenshotUrl: p.screenshotUrl,
      userAgent: p.userAgent,
    })),
    designSystem: { 
      colors, typography, spacing, animations,
      gradients: tokens.gradients || [],
      borderRadii: tokens.borderRadii || [],
      layoutSpecs: tokens.layoutSpecs || [],
      components: tokens.components || [],
    },
    assets: tokens.assets || { images: [], svgs: [] },
    textCopy: tokens.textCopy || [],
    snippets: {
      tailwindConfig: buildTailwindConfig({ colors: tokens.colors || [], typography: tokens.typography || [], spacing: tokens.spacing || [] }),
      cssVars: buildCssVars({ colors: tokens.colors || [], typography: tokens.typography || [], spacing: tokens.spacing || [] }),
    },
    llmInstructions: [
      `You are reconstructing the visual look-and-feel of ${url} as a React + Tailwind component library.`,
      'Source of truth for every visual decision: designSystem.* below. Do NOT introduce colors, fonts, or spacing values that are not in this object.',
      'Step 1 — paste snippets.tailwindConfig into tailwind.config.js (theme.extend). It already names tokens by their inferred semantic role.',
      'Step 2 — paste snippets.cssVars into the :root block of globals.css for components that prefer CSS variables.',
      'Step 3 — match typography exactly. Each entry in designSystem.typography has fontFamily, fontSize (CSS unit), fontWeight, lineHeight, letterSpacing, textTransform, and a real sampleText from the source page.',
      'Step 4 — respect spacing tokens and layoutSpecs. Build the CSS grid logic using the extracted column templates and max-widths.',
      'Step 5 — animations: every transition listed in designSystem.animations has duration, easing, and the properties it animates. Apply via Tailwind utilities or inline transition-* classes.',
      'Step 6 — Reconstruct the components. designSystem.components contains exactly how the buttons are styled, including padding, border radius, backgrounds, gradients and shadows. Use these styles literally.',
      'Step 7 — Insert the actual body text into the components. Read from the textCopy array (grouped by sectionIndex) and fill in headings/paragraphs instead of using lorem ipsum.',
      'Step 8 — Use the exact SVG icons provided in the assets.svgs array when rendering icon placeholders or logos.',
      'Step 9 — preserve WCAG-AA contrast. Each color entry has wcag.onWhite / wcag.onBlack ratings. If a swatch is FAIL on its target background, do not use it for body text.',
      'Output: complete component files plus the updated tailwind.config.js. No prose, just code.',
    ],
  };

  const jsonBuffer = Buffer.from(JSON.stringify(context, null, 2));

  const uploadResult = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: `webimic/jobs/${jobId}`, public_id: 'llm-context', resource_type: 'raw', format: 'json' },
      (err, res) => err ? reject(err) : resolve(res)
    ).end(jsonBuffer);
  });
  console.log('[LLMContext] Upload complete:', { publicId: uploadResult.public_id, elapsedMs: Date.now() - startedAt });

  return uploadResult.secure_url;
};
