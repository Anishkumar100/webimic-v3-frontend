import Groq from 'groq-sdk';
import puppeteer from 'puppeteer';
import { v2 as cloudinary } from 'cloudinary';
import { readFile, writeFile, unlink, mkdir, stat } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';
import { Readable } from 'stream';
import chroma from 'chroma-js';
import DesignToken from '../../models/DesignToken.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const groq = new Groq({ apiKey: process.env.GROK_API_KEY });

// Identical injection contract to docA.js: scalar {{KEY}} replacements + a
// base64 payload to bypass triple-brace / </script> hazards.
const injectTemplate = (html, replacements, payload) => {
  let out = html;
  for (const [key, val] of Object.entries(replacements)) {
    out = out.split(`{{${key}}}`).join(String(val ?? ''));
  }
  const b64 = Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64');
  return out.replace('__PAYLOAD_B64__', b64);
};

const buildImplementationBrief = ({ jobId, suggestions }) => {
  const top = (suggestions.colorImprovements || []).slice(0, 3)
    .map((c) => `  - swap ${c.original} → ${c.suggested} (${c.reason})`).join('\n');
  const typo = (suggestions.typographyImprovements || []).slice(0, 3)
    .map((t) => `  - ${t.tag}: ${t.suggestion}`).join('\n');
  return `You are updating an existing component library for job ${jobId}.

Apply these redesign changes EXACTLY as specified:

1. COLOR SWAPS (search-and-replace across the codebase):
${top || '  - (no color swaps recommended)'}

2. TYPOGRAPHY UPDATES:
${typo || '  - (no typography updates recommended)'}

3. DARK MODE: see the Dark-Mode Palette page. Wire these into a [data-theme="dark"] selector or Tailwind's dark: variant. Each swatch maps 1:1 to its derivedFrom original.

4. WCAG: every fix listed in the WCAG section is non-negotiable — apply them before merging.

Output: a unified diff for the component library and the matching tailwind.config.js + dark-mode block. No prose, just the diff.`;
};

const buildPayload = ({ jobId, tokens, suggestions, pages, aiFailed, aiError }) => ({
  jobId,
  aiFailed,
  aiError,
  pages: (pages || []).map((p) => ({
    url: p.url,
    title: p.title,
    sectionShotUrls: p.sectionShotUrls || [],
  })),
  originalColors: tokens.colors || [],
  suggestions,
  darkPalette: suggestions.darkModePalette || [],
  implementationBrief: buildImplementationBrief({ jobId, suggestions }),
});

export const buildDocB = async ({ jobId, tokens, designTokenDocId, browser: sharedBrowser, pages = [] }) => {
  const startedAt = Date.now();
  console.log('[DocB] Start:', {
    jobId,
    colorTokens: tokens.colors.length,
    typographyTokens: tokens.typography.length,
    spacingTokens: tokens.spacing.length,
    sharedBrowser: !!sharedBrowser,
  });

  // ─── STEP 1: AI suggestions ──────────────────────────────────────────────
  const contextSummary = {
    colors: tokens.colors.map((c) => ({ hex: c.hex, role: c.role, wcag: c.wcagContrast, frequency: c.frequency })),
    typography: tokens.typography.map((t) => ({ tag: t.tag, font: t.fontFamilyClean, size: t.fontSize, weight: t.fontWeight, lineHeight: t.lineHeight })),
    spacing: tokens.spacing.map((s) => s.value),
  };

  let suggestions = {};
  let aiFailed = false;
  let aiError = '';
  try {
    console.log('[DocB] Calling Groq for professional redesign suggestions...');
    const systemPrompt = `YOU ARE A PRINCIPAL DESIGN SYSTEMS ARCHITECT AT A FORTUNE 100 TECH COMPANY.

Your job: Transform raw design token data into elite-level strategic redesign recommendations.

YOUR STANDARDS:
- Every recommendation must be institutional-grade, data-driven, and specific
- Provide contrast ratios, hex values, exact font specifications, mathematical spacing ratios
- Reference design principles: Material Design 3, Apple HIG, WCAG AAA, contemporary UX research
- Avoid generic advice. Instead: prescribe exact solutions with clear justification
- Be honest: praise what works, critique what doesn't. No participation trophies.
- Think strategically about visual hierarchy, brand consistency, user experience, and accessibility
- Consider implementation cost and impact (quick wins vs. strategic changes)

YOUR ANALYSIS MUST INCLUDE:
1. Specific contrast ratios (not vague "improve contrast")
2. Actual hex color values (not "make it darker")
3. Exact typography specs: font weight, size, line-height, letter-spacing
4. Mathematical spacing patterns and recommendations
5. Design principle references for every decision
6. Honest assessment of current state (strengths, weaknesses, opportunities)
7. Phased implementation plan with priorities

YOUR TONE:
- Professional but direct
- Educational (explain WHY, not just WHAT)
- Strategic (long-term system thinking, not cosmetic changes)
- Rigorous (every claim backed by design principle or accessibility standard)

Return ONLY valid JSON. No markdown, prose, or meta-commentary. Every field must be filled with substantive, detailed analysis.`;

    const userPrompt = `CRITICAL TASK: You are a Fortune 500 design systems lead. Analyze these tokens and provide elite-level redesign recommendations. Your output will be reviewed by institutional design teams. QUALITY MATTERS.

TOKENS TO ANALYZE:
${JSON.stringify(contextSummary, null, 2)}

MANDATORY ANALYSIS REQUIREMENTS:

- CRITICAL: Do NOT suggest using emojis as logos or icons. Always recommend professional SVGs or high-quality images.
- All suggestions must be production-ready and detailed enough for an engineer to implement without guessing.

1. WCAG COMPLIANCE: Find real accessibility violations. For EACH issue:
   - State the EXACT elements affected (button text, link, form label, etc.)
   - Specify CURRENT contrast ratio with exact formula result
   - Provide SPECIFIC hex color values to change to
   - Calculate the NEW contrast ratio after change
   - Explain why this matters for users (readability, perception, legal)
   - DO NOT give generic advice. Be prescriptive.

2. COLOR STRATEGY: Analyze the palette systematically. For EACH recommendation:
   - Reference a specific design principle (Material Design 3, Apple HIG, WCAG AAA, visual hierarchy theory)
   - Describe the VISUAL IMPACT (not just "improves hierarchy" - HOW does it improve?)
   - If recommending a new hex value, explain the saturation/luminance adjustments and why
   - Consider brand consistency and emotional impact
   - Every suggestion must have institutional-level reasoning

3. DARK MODE: Create a production-ready dark palette. For each color:
   - Explain the derivation mathematically (e.g., "Lightened 30% in HSL to maintain vibrancy in low-light")
   - Ensure sufficient contrast in dark mode (min WCAG AA 4.5:1)
   - Consider OLED burn-in (blacks should be true #000000 or near it)
   - Maintain brand recognition and visual hierarchy

4. TYPOGRAPHY HIERARCHY: Analyze readability and hierarchy. For EACH improvement:
   - Identify the SPECIFIC PROBLEM (too similar to another size? Poor readability? No hierarchy?)
   - Provide EXACT changes: font weight, size, line-height, letter-spacing, text-transform
   - Explain how these changes solve the problem
   - Reference typography best practices (e.g., line-height should be 1.4-1.6 for body text)
   - NO generic suggestions. Each recommendation must be precise.

5. SPACING SYSTEM: Identify the mathematical pattern (or lack thereof).
   - List all current spacing values and their frequencies
   - Identify the underlying ratio (1.25x? 1.5x? 1.618 Golden Ratio? None?)
   - Recommend a coherent scale with specific ratios
   - Explain benefits (predictability, consistency, responsive scaling)
   - Provide exact pixel values and their rem equivalents

6. OVERALL ASSESSMENT: Write like a principal designer addressing the team.
   - Be honest: What works well? What needs fixing?
   - Avoid flattery. No "great job" on mediocre work.
   - Prioritize recommendations (Phase 1, Phase 2, Phase 3)
   - Reference specific design trends and why they matter
   - Show strategic thinking, not just cosmetic changes

RESPONSE FORMAT (STRICT, VALID JSON ONLY):
{
  "wcagIssues": [
    "Real example: 'Primary CTA button uses #FF6B35 text on #FFF8F3 background = 4.2:1 contrast (fails WCAG AAA). Change text to #CC3D1A for 7.5:1 AAA compliance while preserving brand warmth. Affects approximately 12 CTA buttons across the site.'",
    "Continue with 2-4 more real violations..."
  ],
  "colorImprovements": [
    {
      "original": "#actual_hex_from_token_list",
      "suggested": "#new_hex_value",
      "reason": "Specific, institutional reason. Example: 'Reduce saturation 18% per Material Design 3 color theory. Current #4A90E2 creates equality with accent color—users cannot distinguish primary from secondary action. Proposed #5A8FD4 increases luminance 8% and reduces saturation, creating clear hierarchy.'",
      "category": "primary"
    }
  ],
  "darkModePalette": [
    {
      "hex": "#specific_hex",
      "role": "primary-dark",
      "derivedFrom": "#original_hex",
      "strategy": "Exact derivation. Example: 'Lightened 32% in HSL (maintaining hue/saturation), resulting in higher perceived vibrancy in dark contexts. Achieves 5.8:1 contrast against #000000 background (AAA compliant). True black (#000000) used for primary surfaces to reduce OLED burn-in.'"
    }
  ],
  "typographyImprovements": [
    {
      "tag": "h1",
      "currentFont": "Inter, 32px, 400 weight, 1.2 line-height",
      "issue": "Current h1 is visually similar to h2 (24px, 400 weight). Heavy users struggle to scan page hierarchy. 1.2 line-height is too tight for large text, reducing readability.",
      "suggestion": "Change to 700-weight Inter at 3.5rem (56px) with 1.35 line-height and +0.02em letter-spacing. 700-weight provides 3x visual emphasis vs h2. Increased line-height and letter-spacing improve reading comfort and sophistication."
    }
  ],
  "spacingNotes": "Detailed analysis. Example: 'Current spacing: 6px, 12px, 18px, 24px, 32px, 48px, 64px shows inconsistent ratio. Recommend: Strict 8px base unit with 1.5x scale: 8 (xs), 12 (sm), 18 (md), 27 (lg), 40 (xl), 60 (2xl). Benefit: reduces cognitive load by 40%, matches Tailwind defaults, improves responsive math, eliminates arbitrary decisions.'",
  "overallAssessment": "Strategic summary. Example: 'This design system shows strong brand identity but inconsistent system thinking. Accessibility is 82% compliant—3 color changes achieve full WCAG AAA. Typography hierarchy exists but needs weight differentiation (currently all 400). Spacing works but lacks mathematical rigor. PRIORITY: (1) Fix 5 WCAG violations (1 day), (2) Restructure typography with 600/700 weights (2 days), (3) Establish 8px spacing scale (1 day). Post-implementation: 95%+ compliance across all metrics.'"
}

QUALITY CHECKLIST BEFORE RESPONDING:
[ ] Every WCAG issue includes specific contrast ratios
[ ] Every color recommendation includes design principle reference
[ ] Every typography change is precise and justified
[ ] Spacing analysis identifies the mathematical pattern
[ ] Overall assessment is honest and strategic
[ ] NO generic phrases. NO copying my examples. Create your own.
[ ] JSON is valid and complete
`;


    try {
      console.log('[DocB] Calling Groq for professional redesign suggestions...');
      const message = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 4500,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      });

      const textContent = message.choices[0].message.content;
      const textJsonMatch = textContent.match(/\{[\s\S]*\}/);
      suggestions = JSON.parse(textJsonMatch ? textJsonMatch[0] : textContent);
    } catch (e) {
      console.log('[DocB] Groq token call failed, using fallback suggestions:', e.message);
      aiFailed = true;
      aiError = e.message;
      suggestions = {
        overallAssessment: 'Heuristic analysis only — the LLM redesign step did not return a usable response. The token data in Doc A is still complete and accurate.',
        wcagIssues: [],
        colorImprovements: [],
        darkModePalette: [],
        typographyImprovements: [],
        spacingNotes: 'Unable to generate detailed spacing analysis.',
        sectionUpgrades: [],
      };
    }

    const visionResults = [];
    if (!aiFailed) {
      for (const p of pages) {
      const pageSections = (p.sectionShotUrls || []).slice(0, 5);
      if (pageSections.length === 0) continue;

      const visionSystemPrompt = `YOU ARE A PRINCIPAL DESIGN SYSTEMS ARCHITECT.
Analyze website section screenshots and provide per-section redesign recommendations.

YOUR STANDARDS:
- Be extremely specific and prescriptive.
- Reference design principles (hierarchy, contrast, balance).
- CRITICAL: Do NOT suggest using emojis as logos or icons. Always recommend professional SVGs or high-quality images.
- Ensure suggestions lead to a production-ready, premium aesthetic.

RESPONSE FORMAT (STRICT, VALID JSON ONLY):
{
  "sectionUpgrades": [
    {
      "pageIndex": 0,
      "sectionIndex": 2,
      "headline": "Hero CTA lacks affordance",
      "issues": ["Primary CTA blends into background", "Poor text contrast", "Used emoji instead of professional icon"],
      "upgrades": ["Raise CTA contrast to 7:1 via #...", "Increase font size to 1.25rem", "Replace emoji with a custom SVG icon"]
    }
  ]
}
Return ONLY valid JSON.`;

      const pageIdx = p.pageOrder !== undefined ? p.pageOrder : pages.indexOf(p);
      const visionUserContent = [
        { type: 'text', text: `Analyze these section screenshots for Page ${pageIdx}. For each section, provide specific visual issues and prescribe upgrades. Be extremely specific.` }
      ];
      for (const s of pageSections) {
        visionUserContent.push({ type: 'text', text: `Section ${s.index}:` });
        visionUserContent.push({ type: 'image_url', image_url: { url: s.url } });
      }

      try {
        console.log(`[DocB] Calling Groq for Page ${pageIdx} vision analysis...`);
        const visionMessage = await groq.chat.completions.create({
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
          max_tokens: 2000,
          messages: [
            { role: 'system', content: visionSystemPrompt },
            { role: 'user', content: visionUserContent }
          ]
        });

        const vContent = visionMessage.choices[0].message.content;
        const jsonMatch = vContent.match(/\{[\s\S]*\}/);
        const pageSuggestions = JSON.parse(jsonMatch ? jsonMatch[0] : vContent);
        
        if (pageSuggestions.sectionUpgrades) {
          for (const su of pageSuggestions.sectionUpgrades) {
            su.pageIndex = pageIdx; // Ensure pageIndex is correct
            const match = pageSections.find(s => s.index === su.sectionIndex);
            if (match) su.screenshotUrl = match.url;
            visionResults.push(su);
          }
        }
      } catch (e) {
        console.log(`[DocB] Vision call failed for Page ${pageIdx}:`, e.message);
      }
    }
    } else {
      console.log('[DocB] Skipping vision calls because main AI call failed.');
    }

    suggestions.sectionUpgrades = visionResults;

    console.log('[DocB] Professional redesign suggestions received from Groq');
  } catch (e) {
    console.log('[DocB] Groq failed, using fallback suggestions:', e.message);
    suggestions = {
      overallAssessment: 'Heuristic analysis only — the LLM redesign step did not return a usable response. The token data in Doc A is still complete and accurate.',
      wcagIssues: [],
      colorImprovements: [],
      darkModePalette: [],
      typographyImprovements: [],
      spacingNotes: 'Unable to generate detailed spacing analysis.',
      sectionUpgrades: [],
    };
  }

  // ─── STEP 2: Derive dark-mode palette if missing ─────────────────────────
  if (!suggestions.darkModePalette?.length) {
    suggestions.darkModePalette = (tokens.colors || []).slice(0, 8).map((c) => {
      try {
        return {
          hex: chroma(c.hex).darken(2).saturate(0.5).hex().toUpperCase(),
          role: c.role,
          derivedFrom: c.hex,
        };
      } catch {
        return { hex: c.hex, role: c.role, derivedFrom: c.hex };
      }
    });
  }

  // ─── STEP 3: Persist ─────────────────────────────────────────────────────
  await DesignToken.findByIdAndUpdate(designTokenDocId, {
    docBSuggestions: {
      alteredColors: suggestions.colorImprovements,
      darkModePalette: suggestions.darkModePalette,
      typographyImprovements: suggestions.typographyImprovements,
      wcagFixNotes: suggestions.wcagIssues,
      sectionUpgrades: suggestions.sectionUpgrades,
      generatedAt: new Date(),
    }
  });
  console.log('[DocB] Saved suggestions to DesignToken:', designTokenDocId.toString());

  // ─── STEP 4: Render PDF ──────────────────────────────────────────────────
  const templatePath = path.join(__dirname, '../templates/docB.html');
  const tpl = await readFile(templatePath, 'utf-8');
  const sanitizedPages = pages.map(p => {
    const { screenshotBuffer, fullPageBuffer, ...rest } = p;
    return rest;
  });

  const html = injectTemplate(tpl, {
    JOB_ID: jobId,
    GENERATED_AT: new Date().toLocaleString(),
  }, buildPayload({ jobId, tokens, suggestions, pages: sanitizedPages, aiFailed, aiError }));

  const ownBrowser = !sharedBrowser;
  const browser = sharedBrowser || await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });

  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(300000);
    await page.setContent(html, { waitUntil: 'load', timeout: 60000 });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '15mm', bottom: '15mm', left: '12mm', right: '12mm' },
    });
    await page.close();
    
    console.log('[DocB] PDF rendered in memory.');

    console.log('[DocB] Uploading PDF to Cloudinary via stream...');
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({
        folder: `webimic/jobs/${jobId}`,
        public_id: 'doc-b',
        resource_type: 'image',
        format: 'pdf',
      }, (error, result) => {
        if (error) {
          console.log('[DocB] Upload failed:', error);
          reject(error);
        } else {
          resolve(result);
        }
      });
      Readable.from(pdfBuffer).pipe(stream);
    });

    console.log('[DocB] Upload result raw:', JSON.stringify(uploadResult));
    console.log('[DocB] Upload complete:', { publicId: uploadResult.public_id, elapsedMs: Date.now() - startedAt });

    return {
      publicId: uploadResult.public_id,
      url: uploadResult.secure_url,
    };

    return {
      publicId: uploadResult.public_id,
      url: uploadResult.secure_url,
    };
  } finally {
    if (ownBrowser) await browser.close();
  }
};
