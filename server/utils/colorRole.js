import chroma from 'chroma-js';

// Assigns human-readable roles to color clusters based on luminance + frequency
export const assignColorRole = (colors) => {
  const sorted = [...colors].sort((a, b) => b.frequency - a.frequency);

  return sorted.map((color, i) => {
    const lum = chroma(color.hex).luminance();
    let role = 'Neutral';

    if (i === 0) {
      role = lum > 0.5 ? 'Background' : 'Base Background';
    } else if (i === 1) {
      role = lum > 0.7 ? 'Primary Text' : 'Surface';
    } else if (lum > 0.85) {
      role = 'Light Surface';
    } else if (lum < 0.05) {
      role = 'Deep Background';
    } else if (isSaturated(color.hex)) {
      if (i === 2) role = 'Brand Core';
      else role = 'Accent';
    } else if (lum > 0.4 && lum < 0.7) {
      role = 'Text Muted';
    } else {
      role = `Color ${i + 1}`;
    }

    return { ...color, role };
  });
};

const isSaturated = (hex) => {
  const [, s] = chroma(hex).hsl();
  return s > 0.3;
};
