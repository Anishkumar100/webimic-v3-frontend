export const extractLayout = async (pages) => {
  console.log('[ExtractLayout] Start:', { pageCount: pages.length });
  const allStyles = pages.flatMap((p) => p.rawStyles || []);
  
  const layoutSpecs = [];
  const gridContainers = allStyles.filter(s => s.display === 'grid' && parseFloat(s.width) > 300);
  
  if (gridContainers.length > 0) {
    const cols = new Map();
    gridContainers.forEach(g => {
      if (g.gridTemplateColumns && g.gridTemplateColumns !== 'none') {
        const key = g.gridTemplateColumns;
        cols.set(key, (cols.get(key) || 0) + 1);
      }
    });
    Array.from(cols.entries()).sort((a, b) => b[1] - a[1]).slice(0, 4).forEach(([key, count]) => {
      layoutSpecs.push({
        type: 'grid-template',
        value: key,
        usageCount: count
      });
    });
  }
  
  // Containers
  const maxWidths = new Map();
  allStyles.forEach(s => {
    if (s.maxWidth && s.maxWidth !== 'none' && s.maxWidth.includes('px')) {
      const w = parseFloat(s.maxWidth);
      if (w > 400 && w < 2000) {
        const rounded = Math.round(w / 10) * 10;
        const key = `${rounded}px`;
        maxWidths.set(key, (maxWidths.get(key) || 0) + 1);
      }
    }
  });
  Array.from(maxWidths.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3).forEach(([key, count]) => {
    layoutSpecs.push({
      type: 'container-max-width',
      value: key,
      usageCount: count
    });
  });

  // Z-Index
  const zMap = new Map();
  allStyles.forEach(s => {
    if (s.zIndex && s.zIndex !== 'auto' && s.zIndex !== '0') {
      const z = parseInt(s.zIndex, 10);
      if (!isNaN(z)) {
        const key = `${s.tag}${s.className ? '.' + s.className.split(' ')[0] : ''}`;
        zMap.set(key, { z, position: s.position, top: s.top });
      }
    }
  });
  
  Array.from(zMap.entries()).sort((a, b) => b[1].z - a[1].z).slice(0, 5).forEach(([el, data]) => {
    layoutSpecs.push({
      type: 'z-index',
      element: el,
      value: data.z,
      position: data.position,
      top: data.top
    });
  });

  return layoutSpecs;
};
