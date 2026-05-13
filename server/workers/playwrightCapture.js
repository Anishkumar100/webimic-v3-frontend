import { chromium } from 'playwright';

export const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
];

const BLOCKED_HOSTS = [
  'google-analytics.com',
  'googletagmanager.com',
  'doubleclick.net',
  'googlesyndication.com',
  'googleadservices.com',
  'facebook.net',
  'connect.facebook.net',
  'hotjar.com',
  'segment.io',
  'segment.com',
  'mixpanel.com',
  'amplitude.com',
  'intercom.io',
  'clarity.ms',
  'fullstory.com',
  'mouseflow.com',
  'newrelic.com',
  'nr-data.net',
];

const shouldBlock = (request) => {
  if (request.resourceType() === 'media') return true;
  const url = request.url();
  return BLOCKED_HOSTS.some((host) => url.includes(host));
};

// In-page helpers — run inside page.evaluate.
const GET_SCROLL_HEIGHT = () => {
  let maxH = Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight
  );
  // Also check for scrolling containers (common in custom layouts)
  const elements = document.querySelectorAll('div, section, main');
  for (const el of elements) {
    const style = window.getComputedStyle(el);
    if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
      maxH = Math.max(maxH, el.scrollHeight);
    }
  }
  return maxH;
};
const SCROLL_TO = (y) => {
  window.scrollTo(0, y);
  // Also scroll custom containers (common in Framer sites)
  const elements = document.querySelectorAll('div, section, main');
  for (const el of elements) {
    const style = window.getComputedStyle(el);
    if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
      el.scrollTop = y;
    }
  }
};

// Extract typography + styles. Runs in the browser. Filters hidden / 0-size /
// off-viewport-pre-mount elements and ranks by visual prominence (font size ×
// visible area) rather than raw DOM order, so true headings dominate.
const EXTRACT_RAW_STYLES = (viewportHeight) => {
  const SELECTOR = 'h1,h2,h3,h4,h5,h6,p,a,button,span,div,li,label,code,blockquote,section,article,main,nav,header,footer,aside';
  const out = [];
  const els = document.querySelectorAll(SELECTOR);
  const candidates = [];

  for (const el of els) {
    // offsetParent === null catches display:none and detached subtrees
    if (el.offsetParent === null && el.tagName !== 'BODY') continue;
    const cs = window.getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    if (parseFloat(cs.opacity || '1') < 0.05) continue;

    const rect = el.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    if (width < 4 || height < 4) continue; // zero-box elements

    const text = el.textContent?.trim() || '';
    // Determine section bucket based on absolute Y on the page
    const absoluteY = window.scrollY + rect.y;
    const sectionIndex = viewportHeight ? Math.floor(absoluteY / viewportHeight) : 0;

    const fontSize = parseFloat(cs.fontSize) || 0;
    const area = width * height;
    
    // Prominence = fontSize × sqrt(area).
    // Boost button/link/container prominence to ensure they are captured.
    let tagBoost = 1;
    const tag = el.tagName.toLowerCase();
    if (tag === 'button' || tag === 'a' || cs.cursor === 'pointer') tagBoost = 2.5;
    if (['section','article','nav','header'].includes(tag)) tagBoost = 2.0;
    
    // Boost gradients
    if (cs.backgroundImage && cs.backgroundImage !== 'none' && cs.backgroundImage.includes('gradient')) {
      tagBoost *= 1.5;
    }
    
    const prominence = (fontSize * Math.sqrt(area)) * tagBoost;

    candidates.push({
      el,
      tag,
      className: typeof el.className === 'string' ? el.className : '',
      fontFamily: cs.fontFamily,
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      lineHeight: cs.lineHeight,
      letterSpacing: cs.letterSpacing,
      textTransform: cs.textTransform,
      color: cs.color,
      backgroundColor: cs.backgroundColor,
      backgroundImage: cs.backgroundImage,
      margin: cs.margin,
      padding: cs.padding,
      gap: cs.gap,
      borderRadius: cs.borderRadius,
      boxShadow: cs.boxShadow,
      border: cs.border,
      display: cs.display,
      flexDirection: cs.flexDirection,
      justifyContent: cs.justifyContent,
      alignItems: cs.alignItems,
      width: cs.width,
      height: cs.height,
      maxWidth: cs.maxWidth,
      gridTemplateColumns: cs.gridTemplateColumns,
      gridTemplateRows: cs.gridTemplateRows,
      position: cs.position,
      zIndex: cs.zIndex,
      top: cs.top,
      bottom: cs.bottom,
      left: cs.left,
      right: cs.right,
      textContent: text.substring(0, 150),
      sectionIndex,
      _prominence: prominence,
    });
  }

  // Sort by prominence descending, then take top 2000
  candidates.sort((a, b) => b._prominence - a._prominence);
  for (const c of candidates.slice(0, 2000)) {
    delete c.el;
    delete c._prominence;
    out.push(c);
  }
  return out;
};

const EXTRACT_VISIBLE_STYLES = (sectionIndex) => {
  const SELECTOR = 'h1,h2,h3,h4,h5,h6,p,a,button,span,div,li,label,code,blockquote';
  const els = document.querySelectorAll(SELECTOR);
  const out = [];
  for (const el of els) {
    const rect = el.getBoundingClientRect();
    // Check if fully visible in viewport
    if (rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.innerHeight && rect.right <= window.innerWidth) {
      const width = rect.width;
      const height = rect.height;
      if (width < 4 || height < 4) continue;
      
      const cs = window.getComputedStyle(el);
      out.push({
        sectionIndex,
        backgroundColor: cs.backgroundColor,
        color: cs.color,
        fontFamily: cs.fontFamily,
        fontSize: cs.fontSize,
        backgroundImage: cs.backgroundImage
      });
    }
  }
  return out;
};

const EXTRACT_TEXT_BY_SECTION = (viewportHeight) => {
  const sections = {};
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
  let node;
  while ((node = walker.nextNode())) {
    const text = node.nodeValue.trim();
    if (!text || text.length < 3) continue; // skip empty/whitespace
    
    const el = node.parentElement;
    if (!el) continue;
    const cs = window.getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    
    const rect = el.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) continue;

    const absoluteY = window.scrollY + rect.y;
    const sectionIndex = viewportHeight ? Math.floor(absoluteY / viewportHeight) : 0;
    
    if (!sections[sectionIndex]) sections[sectionIndex] = [];
    sections[sectionIndex].push(text);
  }
  
  return Object.keys(sections).map(k => ({
    sectionIndex: parseInt(k, 10),
    texts: Array.from(new Set(sections[k])) // dedupe texts in section
  }));
};

const EXTRACT_ASSETS = () => {
  const assets = { images: [], svgs: [] };
  
  const imgs = document.querySelectorAll('img');
  for (const img of imgs) {
    if (img.src && !img.src.startsWith('data:') && img.width > 20) {
      assets.images.push({ src: img.src, alt: img.alt || '' });
    }
  }

  const svgs = document.querySelectorAll('svg');
  for (const svg of svgs) {
    const rect = svg.getBoundingClientRect();
    if (rect.width > 12 && rect.height > 12) {
      let html = svg.outerHTML || '';
      if (html.length < 2500) { // Limit length
        assets.svgs.push(html);
      }
    }
  }
  
  // Dedupe
  assets.images = Array.from(new Set(assets.images.map(i => JSON.stringify(i)))).map(i => JSON.parse(i)).slice(0, 30);
  assets.svgs = Array.from(new Set(assets.svgs)).slice(0, 30);
  
  return assets;
};

const EXTRACT_RAW_ANIMATIONS = () => {
  const cssRules = [];
  const animationUsages = []; // { name, durationMs, easing }
  const maxRules = 1500;
  let count = 0;
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        if (count++ >= maxRules) break;
        if (rule.style?.transition) {
          cssRules.push({ type: 'transition', cssText: rule.cssText });
        }
        if (rule.style?.animation || rule.style?.animationName) {
          const name = rule.style.animationName || (rule.style.animation || '').split(' ').find((p) => p && !/[0-9.]+s/.test(p) && p !== 'ease' && p !== 'linear' && p !== 'infinite');
          const dur = (rule.style.animationDuration || rule.style.animation || '').match(/([0-9.]+)(m?s)/);
          const easing = rule.style.animationTimingFunction || (rule.style.animation || '').match(/cubic-bezier\([^)]+\)|ease(?:-in|-out|-in-out)?|linear/)?.[0];
          if (name) {
            animationUsages.push({
              name,
              durationMs: dur ? (dur[2] === 's' ? parseFloat(dur[1]) * 1000 : parseFloat(dur[1])) : null,
              easing: easing || null,
            });
          }
        }
        if (rule.constructor.name === 'CSSKeyframesRule') {
          cssRules.push({ type: 'keyframe', name: rule.name, cssText: rule.cssText });
        }
      }
    } catch {
      // cross-origin stylesheet
    }
  }
  return { cssRules, animationUsages };
};

const SNAPSHOT_RUNTIME_ANIMATIONS = () => {
  // document.getAnimations() catches CSS animations + Web Animations API + most
  // JS libs (Framer Motion, GSAP via WAAPI). Returns one entry per running anim.
  try {
    const anims = document.getAnimations ? document.getAnimations() : [];
    const out = [];
    for (const a of anims) {
      try {
        const timing = a.effect?.getTiming?.() || {};
        const target = a.effect?.target;
        let targetLabel = '';
        if (target && target.tagName) {
          const cls = typeof target.className === 'string' ? target.className.split(' ').filter(Boolean).slice(0, 2).join('.') : '';
          targetLabel = target.tagName.toLowerCase() + (cls ? '.' + cls : '');
        }
        out.push({
          name: a.animationName || a.id || (a.effect && a.effect.constructor.name) || 'anim',
          durationMs: typeof timing.duration === 'number' ? timing.duration : null,
          easing: timing.easing || null,
          iterations: timing.iterations === Infinity ? 'infinite' : (timing.iterations ?? 1),
          target: targetLabel,
          playState: a.playState,
        });
      } catch { /* unsupported animation type */ }
    }
    return out.slice(0, 80);
  } catch {
    return [];
  }
};

const EXTRACT_LINKS = (origin) => {
  const out = new Set();
  for (const a of document.querySelectorAll('a[href]')) {
    try {
      const u = new URL(a.href, origin);
      if (u.origin === origin) {
        u.hash = '';
        out.add(u.toString());
      }
    } catch { /* invalid href */ }
  }
  return Array.from(out);
};

/**
 * Single-page capture with full-page hydration.
 *
 * Sequence:
 *   1. goto + waitForLoadState('domcontentloaded')
 *   2. waitForLoadState('load')  — best-effort
 *   3. AUTO-SCROLL through entire page in steps (triggers lazy mounts)
 *   4. waitForLoadState('networkidle') — let post-scroll fetches settle
 *   5. Scroll back to top
 *   6. Run EXTRACT_RAW_STYLES, EXTRACT_RAW_ANIMATIONS, EXTRACT_LINKS, screenshot
 *
 * `retryIndex` selects which USER_AGENTS entry to use. The crawler bumps it on
 * 403 / 429 / 503 / timeout.
 */
export async function capturePageWithPlaywright(url, viewport, options = {}) {
  const {
    fullPage = false,
    gotoTimeoutMs = 300000,
    settleMs = 600,
    browser: sharedBrowser = null,
    retryIndex = 0,
    scrollStepPx = 600,
    scrollDelayMs = 120,
    networkIdleTimeoutMs = 5000,
  } = options;

  const ownBrowser = !sharedBrowser;
  const browser = sharedBrowser || await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const userAgent = USER_AGENTS[Math.min(retryIndex, USER_AGENTS.length - 1)];
  let context;

  try {
    context = await browser.newContext({ viewport, userAgent });

    await context.route('**/*', (route) => {
      if (shouldBlock(route.request())) return route.abort();
      return route.continue();
    });

    const page = await context.newPage();
    page.setDefaultTimeout(300000);

    const response = await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: gotoTimeoutMs,
    });

    await page.waitForLoadState('load', { timeout: 12000 }).catch(() => {});
    // Wait for animations to finish loading - many sites have 2s+ animation sequences
    if (settleMs > 0) await new Promise((r) => setTimeout(r, Math.max(settleMs, 3000)));

    // Snapshot runtime animations BEFORE scrolling — catches onLoad / autoplay
    // animations (hero entrance effects, JS-driven WAAPI loops).
    const runtimeAnimationsPre = await page.evaluate(SNAPSHOT_RUNTIME_ANIMATIONS).catch(() => []);
    const runtimeAll = [...runtimeAnimationsPre];

    // ─── FULL-PAGE HYDRATION + SECTION SNAPSHOTS ───────────────────────────
    // Scroll one viewport at a time, taking a screenshot at each stop. This
    // triggers IntersectionObserver lazy mounts AND gives us per-section
    // imagery for downstream LLM context. Each shot is the visible viewport
    // (not fullPage) so file sizes stay manageable and sections are isolable.
    const viewportH = viewport?.height || 900;
    const sectionShots = [];
    let pageHeight = await page.evaluate(GET_SCROLL_HEIGHT).catch(() => viewportH);
    const MAX_SECTIONS = 40;
    pageHeight = Math.min(pageHeight, viewportH * MAX_SECTIONS);

    console.log(`[Capture] Starting section captures: viewportH=${viewportH}, initialPageHeight=${pageHeight}, stepPx=${scrollStepPx}`);
    const allVisibleStyles = [];
    let y = 0;
    let sectionIndex = 0;
    while (y < pageHeight && sectionIndex < MAX_SECTIONS) {
      await page.evaluate(SCROLL_TO, y).catch(() => {});
      // Wait for animations and lazy-loaded content - reduced to make it faster
      const waitTime = Math.max(scrollDelayMs, 500);
      await new Promise((r) => setTimeout(r, waitTime));
      
      const runningAnims = await page.evaluate(SNAPSHOT_RUNTIME_ANIMATIONS).catch(() => []);
      for (const a of runningAnims) {
        a.sectionIndex = sectionIndex;
        runtimeAll.push(a);
      }

      const visibleStyles = await page.evaluate(EXTRACT_VISIBLE_STYLES, sectionIndex).catch(() => []);
      allVisibleStyles.push(...visibleStyles);

      const shot = await page.screenshot({ fullPage: false, type: 'jpeg', quality: 80 }).catch((e) => {
        console.log(`[Capture] Screenshot failed at scroll ${y}:`, e.message);
        return null;
      });
      if (shot && shot.length > 0) {
        sectionShots.push({ index: sectionIndex, scrollY: y, buffer: shot });
        console.log(`[Capture] Section ${sectionIndex} captured at y=${y} (${shot.length} bytes)`);
      } else {
        console.log(`[Capture] Section ${sectionIndex} at y=${y} produced no image (${shot ? shot.length : 0} bytes)`);
      }
      sectionIndex++;
      y += scrollStepPx;
      // re-measure: lazy-loaded content may have grown the page
      const newH = await page.evaluate(GET_SCROLL_HEIGHT).catch(() => pageHeight);
      pageHeight = Math.min(Math.max(pageHeight, newH), viewportH * MAX_SECTIONS);
    }

    console.log(`[Capture] Completed ${sectionShots.length} section captures out of ${MAX_SECTIONS} possible`);

    // Snapshot runtime animations AFTER scrolling — catches IntersectionObserver
    // / scroll-triggered effects that only start once their section enters view.
    const runtimeAnimationsPost = await page.evaluate(SNAPSHOT_RUNTIME_ANIMATIONS).catch(() => []);
    for (const a of runtimeAnimationsPost) {
      runtimeAll.push(a);
    }

    await page.waitForLoadState('networkidle', { timeout: networkIdleTimeoutMs }).catch(() => {});
    // Return to top before extraction so any "scroll-into-view" effects reset.
    await page.evaluate(SCROLL_TO, 0).catch(() => {});
    await new Promise((r) => setTimeout(r, 400));

    const httpStatus = response?.status?.() ?? null;

    // Primary screenshot — hero (top of page) for color extraction & preview.
    const screenshotBuffer = sectionShots[0]?.buffer || await page.screenshot({
      fullPage,
      type: 'jpeg',
      quality: 82,
    });

    // Stitched full-page screenshot — gives Doc B + LLM context an at-a-glance
    // view of the whole layout. Larger than a single viewport shot but capped
    // by Playwright's max screenshot size.
    const fullPageBuffer = await page.screenshot({
      fullPage: true,
      type: 'jpeg',
      quality: 78,
    }).catch((e) => {
      console.log('[Capture] Full-page screenshot failed:', e.message);
      return null;
    });

    const rawStyles = await page.evaluate(EXTRACT_RAW_STYLES, viewportH);
    const sectionText = await page.evaluate(EXTRACT_TEXT_BY_SECTION, viewportH);
    const rawAssets = await page.evaluate(EXTRACT_ASSETS);
    const cssAnimationData = await page.evaluate(EXTRACT_RAW_ANIMATIONS);
    const rawAnimations = {
      cssRules: cssAnimationData.cssRules || [],
      animationUsages: cssAnimationData.animationUsages || [],
      runtime: runtimeAll,
    };
    
    const stylesheetGradients = await page.evaluate(() => {
      const grads = new Set();
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            const css = rule.cssText;
            if (css && (css.includes('linear-gradient') || css.includes('radial-gradient'))) {
              const matches = css.match(/(linear|radial)-gradient\([^)]+\)/g);
              if (matches) {
                matches.forEach(m => grads.add(m));
              }
            }
          }
        } catch (e) {
          // Ignore cross-origin stylesheet errors
        }
      }
      return Array.from(grads);
    });

    const title = await page.title();
    const sameDomainLinks = await page.evaluate(EXTRACT_LINKS, new URL(url).origin).catch(() => []);

    return {
      url,
      title: title || new URL(url).hostname,
      screenshotBuffer,
      fullPageBuffer,
      sectionShots, // [{ index, scrollY, buffer }]
      rawStyles,
      visibleStyles: allVisibleStyles,
      sectionText,
      rawAssets,
      rawAnimations,
      stylesheetGradients,
      httpStatus,
      linkCount: sameDomainLinks.length,
      sameDomainLinks,
      userAgent,
    };
  } finally {
    if (context) await context.close().catch(() => {});
    if (ownBrowser) await browser.close().catch(() => {});
  }
}
