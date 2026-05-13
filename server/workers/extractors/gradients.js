export const extractGradients = async (pages) => {
  console.log('[ExtractGradients] Start:', { pageCount: pages.length });
  const allStyles = pages.flatMap((p) => p.rawStyles || []);
  const stylesheetGradients = pages.flatMap((p) => p.stylesheetGradients || []);
  const map = new Map();

  for (const g of stylesheetGradients) {
    map.set(g, (map.get(g) || 0) + 1);
  }

  for (const style of allStyles) {
    const bg = style.backgroundImage;
    if (bg && bg !== 'none' && (bg.includes('linear-gradient') || bg.includes('radial-gradient'))) {
      // Exclude urls if mixed
      if (bg.includes('url(')) continue;
      map.set(bg, (map.get(bg) || 0) + 1);
    }
  }

  const sorted = Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const result = sorted.map(([value, count], i) => ({
    name: `gradient-${i + 1}`,
    value,
    usageCount: count
  }));
  
  console.log('[ExtractGradients] Complete:', { tokenCount: result.length });
  return result;
};
