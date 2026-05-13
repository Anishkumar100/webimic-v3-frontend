export const extractComponents = async (pages) => {
  console.log('[ExtractComponents] Start:', { pageCount: pages.length });
  const allStyles = pages.flatMap((p) => p.rawStyles || []);
  
  const buttons = allStyles.filter(s => s.tag === 'button' || (s.className && s.className.includes('btn')));
  const componentMap = new Map();
  
  buttons.forEach(b => {
    const key = JSON.stringify({
      padding: b.padding,
      backgroundColor: b.backgroundColor,
      backgroundImage: b.backgroundImage,
      color: b.color,
      borderRadius: b.borderRadius,
      boxShadow: b.boxShadow,
      border: b.border
    });
    if (!componentMap.has(key)) {
      componentMap.set(key, { count: 1, sampleText: b.textContent || 'Button', style: b });
    } else {
      componentMap.get(key).count++;
    }
  });

  const sorted = Array.from(componentMap.values()).sort((a, b) => b.count - a.count).slice(0, 6);
  
  const result = sorted.map((b, i) => ({
    name: `Button Variant ${i + 1}`,
    usageCount: b.count,
    sampleText: b.sampleText,
    css: {
      padding: b.style.padding,
      backgroundColor: b.style.backgroundColor,
      backgroundImage: b.style.backgroundImage,
      color: b.style.color,
      borderRadius: b.style.borderRadius,
      boxShadow: b.style.boxShadow,
      border: b.style.border,
      fontFamily: b.style.fontFamily,
      fontSize: b.style.fontSize,
      fontWeight: b.style.fontWeight
    }
  }));

  console.log('[ExtractComponents] Complete:', { count: result.length });
  return result;
};
