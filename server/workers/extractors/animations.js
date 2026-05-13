// Extracts animation tokens from three sources:
//   1. CSS transition rules            (hover-style state changes)
//   2. CSS @keyframes + animation usages (declarative loops / entrance effects)
//   3. document.getAnimations()        (runtime — Framer Motion, GSAP, WAAPI)
//
// The capture stage delivers `rawAnimations` either as the legacy plain array
// (backwards-compat) or as `{ cssRules, animationUsages, runtime }`.

const ANIMATABLE_PROPS = ['transform', 'opacity', 'filter', 'background', 'background-color', 'color', 'box-shadow', 'border-radius', 'width', 'height', 'top', 'left', 'right', 'bottom', 'translate', 'rotate', 'scale'];

const parseKeyframeProperties = (cssText = '') => {
  const props = new Set();
  for (const p of ANIMATABLE_PROPS) {
    // Look for "<prop>:" inside any keyframe selector. Keep it cheap — no full
    // CSS parser, just a substring check guarded by a colon.
    if (cssText.includes(p + ':') || cssText.includes(p + ' :')) {
      props.add(p);
    }
  }
  return Array.from(props);
};

const parseTransition = (cssText) => {
  const match = cssText?.match(/transition:\s*([^;]+)/);
  if (!match) return null;
  const value = match[1].trim();
  const parts = value.split(/\s+/);
  const property = parts.find((p) => !/^\d/.test(p) && !['ease', 'linear', 'ease-in', 'ease-out', 'ease-in-out'].includes(p)) || 'all';
  const duration = parts.find((p) => /^\d/.test(p) && p.includes('s')) || '0.3s';
  const easing = parts.find((p) => ['ease', 'linear', 'ease-in', 'ease-out', 'ease-in-out'].includes(p)) || 'ease';
  return { property, duration, easing };
};

const msFromDuration = (str) => {
  if (!str) return 1000;
  const m = String(str).match(/([0-9.]+)(m?s)/);
  if (!m) return 1000;
  return m[2] === 's' ? parseFloat(m[1]) * 1000 : parseFloat(m[1]);
};

export const extractAnimations = async (pages) => {
  console.log('[ExtractAnimations] Start:', { pageCount: pages.length });

  const cssRules = [];
  const animationUsages = [];
  const runtime = [];

  for (const p of pages) {
    const raw = p.rawAnimations;
    if (!raw) continue;
    if (Array.isArray(raw)) {
      cssRules.push(...raw);
    } else {
      cssRules.push(...(raw.cssRules || []));
      animationUsages.push(...(raw.animationUsages || []));
      runtime.push(...(raw.runtime || []));
    }
  }

  console.log('[ExtractAnimations] Raw counts:', { cssRules: cssRules.length, animationUsages: animationUsages.length, runtime: runtime.length });

  const usageByName = new Map();
  for (const u of animationUsages) {
    if (!u.name) continue;
    if (!usageByName.has(u.name)) usageByName.set(u.name, u);
  }

  const result = [];
  const seen = new Set();

  // 1. Transitions
  for (const anim of cssRules) {
    if (anim.type !== 'transition') continue;
    const parsed = parseTransition(anim.cssText);
    if (!parsed) continue;
    const key = `transition:${parsed.property}:${parsed.duration}:${parsed.easing}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({
      type: 'transition',
      trigger: 'onHover',
      target: 'element',
      duration: parsed.duration,
      durationMs: msFromDuration(parsed.duration),
      easing: parsed.easing,
      properties: [parsed.property],
    });
  }

  // 2. Keyframes — pull real properties from the @keyframes body and real
  //    duration/easing from the matching `animation:` usage when available.
  for (const anim of cssRules) {
    if (anim.type !== 'keyframe') continue;
    const key = `keyframe:${anim.name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const usage = usageByName.get(anim.name);
    const props = parseKeyframeProperties(anim.cssText);
    const durationMs = usage?.durationMs ?? 1000;
    result.push({
      type: 'keyframe',
      trigger: 'onLoad',
      target: `.${anim.name}`,
      name: anim.name,
      duration: `${(durationMs / 1000).toFixed(2)}s`,
      durationMs,
      easing: usage?.easing || 'ease',
      properties: props.length ? props : ['transform', 'opacity'],
    });
  }

  // 3. Runtime — dedupe across pre/post scroll snapshots.
  for (const r of runtime) {
    const dur = r.durationMs ?? 0;
    const key = `runtime:${r.name}:${dur}:${r.target || ''}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const sectionInfo = (r.sectionIndex !== undefined) ? ` (Section ${r.sectionIndex + 1})` : '';
    result.push({
      type: 'runtime',
      trigger: r.sectionIndex !== undefined ? `scroll to §${r.sectionIndex + 1}` : 'js',
      target: r.target || 'element',
      name: `${r.name}${sectionInfo}`,
      duration: dur ? `${(dur / 1000).toFixed(2)}s` : 'n/a',
      durationMs: dur,
      easing: r.easing || 'unknown',
      iterations: r.iterations,
      properties: [],
    });
  }

  const limited = result.slice(0, 40);
  console.log('[ExtractAnimations] Complete:', { animationTokens: limited.length });
  return limited;
};
