export const extractSpacing = async (pages) => {
  console.log('[ExtractSpacing] Start:', { pageCount: pages.length });
  const allStyles = pages.flatMap((p) => p.rawStyles || []);
  console.log('[ExtractSpacing] Raw style rows:', allStyles.length);
  const spacingMap = new Map();

  for (const style of allStyles) {
    const values = [
      ...(style.margin || '').split(' '),
      ...(style.padding || '').split(' '),
      ...[style.gap || ''],
    ];

    for (const val of values) {
      const numeric = parseFloat(val);
      if (!val || isNaN(numeric) || numeric <= 0 || numeric > 200) continue;
      const key = `${numeric}px`;
      spacingMap.set(key, (spacingMap.get(key) || 0) + 1);
    }
  }

  // Build spacing tokens from most common values
  const sorted = Array.from(spacingMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 16);

  // Normalize to a design scale (round to nearest 4px)
  const scaleSet = new Set();
  sorted.forEach(([val]) => {
    const n = parseFloat(val);
    const rounded = Math.round(n / 4) * 4;
    if (rounded > 0) scaleSet.add(rounded);
  });

  const result = Array.from(scaleSet)
    .sort((a, b) => a - b)
    .map((value, i) => ({
      name: `sp-${i + 1}`,
      value: `${value}px`,
      numericValue: value,
      usageCount: spacingMap.get(`${value}px`) || 0,
      category: value <= 8 ? 'tight' : value <= 24 ? 'medium' : 'loose',
    }));
  console.log('[ExtractSpacing] Complete:', { uniqueSpacingTokens: result.length });
  return result;
};
