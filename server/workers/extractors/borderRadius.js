export const extractBorderRadius = async (pages) => {
  console.log('[ExtractBorderRadius] Start:', { pageCount: pages.length });
  const allStyles = pages.flatMap((p) => p.rawStyles || []);
  const map = new Map();

  for (const style of allStyles) {
    const br = style.borderRadius;
    if (!br || br === '0px' || br === 'none') continue;
    map.set(br, (map.get(br) || 0) + 1);
  }

  const sorted = Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const result = sorted.map(([value, count], i) => ({
    name: `radius-${i + 1}`,
    value,
    usageCount: count
  }));

  console.log('[ExtractBorderRadius] Complete:', { tokenCount: result.length });
  return result;
};
