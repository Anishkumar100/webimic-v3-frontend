import puppeteer from 'puppeteer';
import { v2 as cloudinary } from 'cloudinary';
import { readFile, writeFile, unlink, mkdir, stat } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';
import { Readable } from 'stream';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Build a Tailwind v3 theme.extend snippet from the extracted tokens. This
// goes into the PDF verbatim so an LLM (or a human) can paste it straight
// into tailwind.config.js for a 1:1 visual match.
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
${colorEntries || "        // no colors extracted"}
      },
      fontFamily: {
${fontEntries || "        // no fonts extracted"}
      },
      spacing: {
${spacingEntries || "        // no spacing tokens extracted"}
      },
    },
  },
};`;
};

// Build a CSS custom-properties block. Drop into :root of globals.css.
const buildCssVars = ({ colors, typography, spacing }) => {
  const colorLines = colors.map((c, i) => {
    const key = c.role && c.role !== 'neutral' ? c.role : `palette-${i + 1}`;
    return `  --color-${key}: ${c.hex};`;
  });
  const fontLines = Array.from(new Set(typography.map((t) => t.fontFamilyClean).filter(Boolean)))
    .map((f, i) => `  --font-${i === 0 ? 'display' : i === 1 ? 'body' : `alt-${i - 1}`}: '${f}';`);
  const spaceLines = spacing.map((s) => `  --space-${s.name}: ${s.value};`);
  return `:root {
${[...colorLines, ...fontLines, ...spaceLines].join('\n') || '  /* no tokens extracted */'}
}`;
};

const buildLLMPrompt = ({ pageUrl, colors, typography, spacing }) => {
  const heroColor = colors.find((c) => c.role === 'brand')?.hex || colors[0]?.hex || '(see palette)';
  return `You are an expert, award-winning front-end engineer. Your objective is to build a pixel-perfect, highly polished React + Tailwind component library that flawlessly recreates the visual design system of ${pageUrl || 'the reference site'}.

You have been provided with an exhaustive, machine-extracted set of design tokens. You must treat this document as your absolute source of truth.

### Instructions & Rules:
1. DESIGN TOKENS FIRST: 
   - Paste the provided Tailwind config block into your tailwind.config.js to set up the exact color palette, typography scale, and spacing tokens.
   - Use the brand color (${heroColor}) for primary CTAs, hover states, and accent borders.
   - Do NOT invent new colors or spacing values. Always map to the provided tokens.

2. COMPONENT FIDELITY:
   - Recreate the exact button styles and interactive elements listed in the "Component Styles" section. Pay close attention to padding, border-radius, gradients, and box-shadows.
   - Ensure all interactive elements have visible focus states for accessibility.

3. TYPOGRAPHY & COPY:
   - Match the typography hierarchy perfectly. If a heading is missing a style, fall back to the closest larger heading token.
   - The "Section Text Copy" block contains the actual content of the page. Inject this text directly into your React components to make the design feel authentic. Do not use Lorem Ipsum placeholders.

4. ASSETS & ICONS:
   - For icons and imagery, use the inline SVG code extracted in the "Assets & Icons" section. 
   - CRITICAL: Do NOT use any emojis as logos or icons. Use professional SVGs or high-quality images. If an SVG is missing, use a standard Lucide or Heroicon instead of a placeholder or emoji.

5. LAYOUT & RESPONSIVENESS:
   - Use the Layout & Grid Constraints table to replicate the exact breakpoints, CSS Grid definitions, and maximum widths.
   - Respect z-index stacking rules as defined in the constraints.
   - Ensure the design is fully responsive across mobile, tablet, and desktop using Tailwind's responsive modifiers (sm:, md:, lg:, etc.).

6. PRODUCTION READINESS:
   - Code must be clean, modular, and reusable. Follow React best practices.
   - Implement appropriate semantic HTML elements (nav, header, footer, article, etc.).
   - Add smooth transitions and hover effects for interactive elements to create a premium feel.

Deliver a single, comprehensive React component file accompanied by the matching tailwind.config.js. Deliver code that is clean, responsive, and visually stunning. No commentary is needed—just expert-level code.`;
};

const buildPayload = ({ jobId, pages, tokens, pageUrl, sectionStyles }) => ({
  jobId,
  pageUrl,
  pages: pages.map((p) => ({
    url: p.url,
    title: p.title,
    linkCount: p.linkCount,
    screenshotUrl: p.screenshotUrl,
    sectionShotUrls: p.sectionShotUrls || [],
    links: p.links || [],
  })),
  colors: tokens.colors || [],
  typography: tokens.typography || [],
  spacing: tokens.spacing || [],
  animations: tokens.animations || [],
  gradients: tokens.gradients || [],
  borderRadii: tokens.borderRadii || [],
  layoutSpecs: tokens.layoutSpecs || [],
  components: tokens.components || [],
  assets: tokens.assets || { images: [], svgs: [] },
  textCopy: tokens.textCopy || [],
  sectionStyles: sectionStyles || [],
  tailwindConfig: buildTailwindConfig({ colors: tokens.colors || [], typography: tokens.typography || [], spacing: tokens.spacing || [] }),
  cssVars: buildCssVars({ colors: tokens.colors || [], typography: tokens.typography || [], spacing: tokens.spacing || [] }),
  llmPrompt: buildLLMPrompt({ pageUrl, colors: tokens.colors || [], typography: tokens.typography || [], spacing: tokens.spacing || [] }),
});

const injectTemplate = (html, replacements, payload) => {
  // 1. Scalar replacements (job id, urls, etc.)
  let out = html;
  for (const [key, val] of Object.entries(replacements)) {
    out = out.split(`{{${key}}}`).join(String(val ?? ''));
  }
  // 2. Payload — base64-encode so embedded JSON braces / </script> / brace
  //    parsing all become inert. The template decodes via atob() before parse.
  const b64 = Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64');
  out = out.replace('__PAYLOAD_B64__', b64);
  return out;
};

export const buildDocA = async ({ jobId, pages, tokens, browser: sharedBrowser }) => {
  const startedAt = Date.now();
  console.log('[DocA] Start:', { jobId, pageCount: pages.length, colorTokens: tokens.colors.length, sharedBrowser: !!sharedBrowser });

  const templatePath = path.join(__dirname, '../templates/docA.html');
  const tpl = await readFile(templatePath, 'utf-8');
  const pageUrl = pages[0]?.url || '';
  
  const sanitizedPages = pages.map(p => {
    const { screenshotBuffer, fullPageBuffer, ...rest } = p;
    return rest;
  });

  const sectionData = [];
  pages.forEach(p => {
    const styles = p.visibleStyles || [];
    styles.forEach(s => {
      const idx = s.sectionIndex || 0;
      if (!sectionData[idx]) {
        sectionData[idx] = {
          sectionIndex: idx,
          colors: new Set(),
          typography: new Set(),
          gradients: new Set()
        };
      }
      if (s.backgroundColor && s.backgroundColor !== 'rgba(0, 0, 0, 0)' && s.backgroundColor !== 'transparent') {
        sectionData[idx].colors.add(s.backgroundColor);
      }
      if (s.color) {
        sectionData[idx].colors.add(s.color);
      }
      if (s.fontFamily && s.fontSize) {
        sectionData[idx].typography.add(`${s.fontFamily} ${s.fontSize}`);
      }
      if (s.backgroundImage && s.backgroundImage.includes('gradient')) {
        sectionData[idx].gradients.add(s.backgroundImage);
      }
    });
  });

  const sectionStyles = sectionData.map(s => ({
    sectionIndex: s.sectionIndex,
    colors: Array.from(s.colors).slice(0, 5),
    typography: Array.from(s.typography).slice(0, 3),
    gradients: Array.from(s.gradients).slice(0, 2)
  }));

  const html = injectTemplate(tpl, {
    JOB_ID: jobId,
    PAGE_URL: pageUrl,
    PAGE_COUNT: pages.length,
    SCREENSHOT_URL: pages[0]?.screenshotUrl || '',
    GENERATED_AT: new Date().toLocaleString(),
  }, buildPayload({ jobId, pages: sanitizedPages, tokens, pageUrl, sectionStyles }));

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
    
    const sizeInMB = (pdfBuffer.length / (1024 * 1024)).toFixed(2);
    console.log(`[DocA] PDF rendered in memory. Size: ${sizeInMB} MB`);

    console.log('[DocA] Uploading PDF to Cloudinary via stream...');
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({
        folder: `webimic/jobs/${jobId}`,
        public_id: 'doc-a',
        resource_type: 'image',
        format: 'pdf',
      }, (error, result) => {
        if (error) {
          console.log('[DocA] Upload failed:', error);
          reject(error);
        } else {
          resolve(result);
        }
      });
      Readable.from(pdfBuffer).pipe(stream);
    });

    console.log('[DocA] Upload result raw:', JSON.stringify(uploadResult));

    // DISABLING UNLINK TO AVOID RACE CONDITION
    // await unlink(tempFilePath).catch(e => console.log('[DocA] Failed to delete temp file:', e.message));

    console.log('[DocA] Upload complete:', { publicId: uploadResult.public_id, elapsedMs: Date.now() - startedAt });

    return {
      publicId: uploadResult.public_id,
      url: uploadResult.secure_url,
      size: `${sizeInMB} MB`,
    };
  } finally {
    if (ownBrowser) await browser.close();
  }
};
